"""
Phase 1A — BLS Occupational Employment & Wage Statistics collector.

Free API, no key required for ≤25 requests/day.
Pulls wage percentiles for SDR (SOC 41-3091) and AE (SOC 41-4011) roles.
"""

import json
import time
from pathlib import Path

import pandas as pd
import requests

BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
RAW_DIR = Path(__file__).resolve().parent.parent / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"

# OEWS series IDs for national-level data
# Format: OEU + area_code + industry_code + occ_code + data_type
# National = N0000000, All industries = 000000
# Data types: 01=employment, 04=mean wage, 07=10th pct, 08=25th pct, 12=median, 13=75th pct, 14=90th pct

SOC_CODES = {
    "SDR": "413091",  # Sales Representatives, Services (closest BLS proxy for SDR/BDR)
    "AE": "414011",   # Sales Representatives, Wholesale and Manufacturing (closest AE proxy)
}

DATA_TYPES = {
    "employment": "01",
    "mean_annual": "04",
    "pct_10": "07",
    "pct_25": "08",
    "median": "12",
    "pct_75": "13",
    "pct_90": "14",
}

# Major metro areas with large tech/SaaS employment
METRO_AREAS = {
    "N0000000": "National",
    "0000003": "Los Angeles-Long Beach-Anaheim, CA",
    "0000041": "San Francisco-Oakland-Hayward, CA",
    "0000042": "Seattle-Tacoma-Bellevue, WA",
    "0000035": "New York-Newark-Jersey City, NY-NJ-PA",
    "0000014": "Chicago-Naperville-Elgin, IL-IN-WI",
    "0000019": "Dallas-Fort Worth-Arlington, TX",
    "0000011": "Boston-Cambridge-Newton, MA-NH",
    "0000007": "Atlanta-Sandy Springs-Roswell, GA",
    "0000020": "Denver-Aurora-Lakewood, CO",
    "0000008": "Austin-Round Rock, TX",
}


def build_series_ids(area_code: str = "N0000000") -> list[dict]:
    """Build BLS series IDs for all role × data_type combinations."""
    series = []
    for role_name, soc in SOC_CODES.items():
        for dt_name, dt_code in DATA_TYPES.items():
            series_id = f"OEUM{area_code}000000{soc}0000{dt_code}"
            series.append({
                "series_id": series_id,
                "role": role_name,
                "data_type": dt_name,
                "area_code": area_code,
            })
    return series


def fetch_bls_data(series_ids: list[str], start_year: int = 2019, end_year: int = 2025, api_key: str | None = None) -> dict:
    """
    Fetch data from BLS API v2.

    Without API key: 25 requests/day, 10 series per request.
    With free API key: 500 requests/day, 50 series per request.
    """
    payload = {
        "seriesid": series_ids[:10],  # Max 10 without key
        "startyear": str(start_year),
        "endyear": str(end_year),
    }
    if api_key:
        payload["registrationkey"] = api_key
        payload["seriesid"] = series_ids[:50]

    headers = {"Content-Type": "application/json"}
    try:
        resp = requests.post(BASE_URL, data=json.dumps(payload), headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except (requests.RequestException, Exception) as e:
        print(f"  BLS API request failed: {e}")
        return {"status": "REQUEST_FAILED", "message": str(e)}


def parse_bls_response(response: dict, series_meta: list[dict]) -> pd.DataFrame:
    """Parse BLS JSON response into a flat DataFrame."""
    rows = []
    meta_lookup = {s["series_id"]: s for s in series_meta}

    if response.get("status") != "REQUEST_SUCCEEDED":
        print(f"BLS API warning: {response.get('message', 'Unknown error')}")
        return pd.DataFrame()

    for series in response.get("Results", {}).get("series", []):
        sid = series["seriesID"]
        meta = meta_lookup.get(sid, {})

        for entry in series.get("data", []):
            value = entry.get("value", "")
            if value in ("-", "N/A", ""):
                continue
            rows.append({
                "series_id": sid,
                "role": meta.get("role", "unknown"),
                "data_type": meta.get("data_type", "unknown"),
                "area_code": meta.get("area_code", "N0000000"),
                "year": int(entry["year"]),
                "period": entry["period"],
                "value": float(value.replace(",", "")),
            })

    return pd.DataFrame(rows)


def collect_national_data(api_key: str | None = None) -> pd.DataFrame:
    """Collect national-level wage data for SDR and AE roles."""
    series_meta = build_series_ids("N0000000")
    series_ids = [s["series_id"] for s in series_meta]

    print(f"Fetching {len(series_ids)} national BLS series...")
    response = fetch_bls_data(series_ids, api_key=api_key)
    df = parse_bls_response(response, series_meta)
    print(f"  → {len(df)} records retrieved")
    return df


def collect_metro_data(api_key: str | None = None) -> pd.DataFrame:
    """Collect metro-level wage data. Requires batching due to API limits."""
    all_frames = []

    for area_code, area_name in METRO_AREAS.items():
        if area_code == "N0000000":
            continue  # National handled separately

        series_meta = build_series_ids(area_code)
        series_ids = [s["series_id"] for s in series_meta]

        print(f"Fetching metro: {area_name}...")
        try:
            response = fetch_bls_data(series_ids, api_key=api_key)
            df = parse_bls_response(response, series_meta)
            df["area_name"] = area_name
            all_frames.append(df)
            print(f"  → {len(df)} records")
        except Exception as e:
            print(f"  → Error: {e}")

        # Rate limiting: 25 requests/day without key
        time.sleep(1.5)

    if all_frames:
        return pd.concat(all_frames, ignore_index=True)
    return pd.DataFrame()


def pivot_wage_percentiles(df: pd.DataFrame) -> pd.DataFrame:
    """Pivot long-format BLS data into wide format with percentile columns."""
    if df.empty:
        return df

    # Get most recent year's annual data only
    annual = df[df["period"] == "M13"].copy()  # M13 = annual average
    if annual.empty:
        # Fall back to most recent period
        latest_year = df["year"].max()
        annual = df[df["year"] == latest_year].copy()

    pivot = annual.pivot_table(
        index=["role", "area_code", "year"],
        columns="data_type",
        values="value",
        aggfunc="first",
    ).reset_index()

    pivot.columns.name = None
    return pivot


def run(api_key: str | None = None) -> Path:
    """Main entry point — collect all BLS data and save."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # National data (1 API call)
    national = collect_national_data(api_key)

    # Metro data (10 API calls — only if national succeeded)
    if not national.empty:
        metro = collect_metro_data(api_key)
    else:
        print("Skipping metro data (national fetch failed).")
        metro = pd.DataFrame()

    # Combine
    if not national.empty:
        national["area_name"] = "National"
    combined = pd.concat([national, metro], ignore_index=True)

    if combined.empty:
        print("WARNING: No BLS data retrieved. Check API availability.")
        # Write fallback data from published BLS tables
        combined = _fallback_data()

    # Save raw
    raw_path = RAW_DIR / "bls_raw.csv"
    combined.to_csv(raw_path, index=False)
    print(f"Saved raw BLS data → {raw_path}")

    # Process into wide format
    wide = pivot_wage_percentiles(combined)
    processed_path = PROCESSED_DIR / "bls_compensation.parquet"
    if not wide.empty:
        wide.to_parquet(processed_path, index=False)
        print(f"Saved processed BLS data → {processed_path}")
    else:
        # Save CSV fallback if parquet fails
        processed_path = PROCESSED_DIR / "bls_compensation.csv"
        combined.to_csv(processed_path, index=False)
        print(f"Saved processed BLS data (csv fallback) → {processed_path}")

    return processed_path


def _fallback_data() -> pd.DataFrame:
    """
    Hardcoded BLS reference data from published OEWS tables.
    Used when API is unavailable or rate-limited.
    Source: BLS OEWS May 2023 National Estimates (most recent published).
    """
    rows = [
        # SDR (41-3091): Sales Reps, Services
        {"role": "SDR", "data_type": "employment", "value": 1_778_000, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "pct_10", "value": 33_120, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "pct_25", "value": 44_200, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "median", "value": 62_890, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "pct_75", "value": 94_710, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "pct_90", "value": 136_180, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "SDR", "data_type": "mean_annual", "value": 76_680, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        # AE (41-4011): Sales Reps, Wholesale & Manufacturing
        {"role": "AE", "data_type": "employment", "value": 1_443_000, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "pct_10", "value": 35_580, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "pct_25", "value": 49_200, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "median", "value": 73_080, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "pct_75", "value": 109_200, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "pct_90", "value": 164_000, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
        {"role": "AE", "data_type": "mean_annual", "value": 88_470, "year": 2023, "area_code": "N0000000", "area_name": "National", "period": "M13"},
    ]
    return pd.DataFrame(rows)


if __name__ == "__main__":
    import sys
    key = sys.argv[1] if len(sys.argv) > 1 else None
    run(api_key=key)
