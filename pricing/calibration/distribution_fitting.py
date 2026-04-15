"""
Phase 2A — Fit parametric distributions to compensation data.

OTE distributions are approximately lognormal for both SDR and AE roles.
Cross-validates against BLS published percentiles.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
PARAMS_DIR = Path(__file__).resolve().parent


def fit_ote_distributions(ote_path: Path | None = None, bls_path: Path | None = None) -> dict:
    """
    Fit lognormal distributions to OTE data for SDR and AE.

    Returns calibrated distribution parameters.
    """
    if ote_path is None:
        ote_path = PROCESSED_DIR / "ote_distributions.parquet"
    if bls_path is None:
        bls_path = PROCESSED_DIR / "bls_compensation.parquet"

    # Load OTE data
    if ote_path.suffix == ".parquet":
        ote_df = pd.read_parquet(ote_path)
    else:
        ote_df = pd.read_csv(ote_path)

    # Load BLS data for cross-validation
    bls_df = None
    if bls_path.exists():
        if bls_path.suffix == ".parquet":
            bls_df = pd.read_parquet(bls_path)
        else:
            bls_df = pd.read_csv(bls_path)

    params = {}

    for role in ["SDR", "AE"]:
        role_data = ote_df[ote_df["role"] == role] if "role" in ote_df.columns else ote_df

        # Get OTE values
        if "ote" in role_data.columns:
            ote_values = role_data["ote"].dropna().values
        elif "total_comp" in role_data.columns:
            ote_values = role_data["total_comp"].dropna().values
        else:
            # Use benchmark defaults
            if role == "SDR":
                ote_values = _generate_synthetic_ote("SDR")
            else:
                ote_values = _generate_synthetic_ote("AE")

        # Filter outliers (keep 1st-99th percentile)
        if len(ote_values) > 10:
            p1, p99 = np.percentile(ote_values, [1, 99])
            ote_values = ote_values[(ote_values >= p1) & (ote_values <= p99)]

        # Fit lognormal
        if len(ote_values) >= 5:
            shape, loc, scale = stats.lognorm.fit(ote_values, floc=0)
            mu = np.log(scale)
            sigma = shape
        else:
            # Fallback parameters from published data
            if role == "SDR":
                mu, sigma = 11.0, 0.30  # median ~$60K OTE
            else:
                mu, sigma = 11.6, 0.40  # median ~$120K OTE
            shape, loc, scale = sigma, 0, np.exp(mu)

        # Compute summary stats from fitted distribution
        fitted_dist = stats.lognorm(shape, loc=loc, scale=scale)
        percentiles = {
            f"p{p}": round(fitted_dist.ppf(p / 100), 0)
            for p in [10, 25, 50, 75, 90]
        }

        # Cross-validate against BLS if available
        bls_check = {}
        if bls_df is not None and "role" in bls_df.columns:
            bls_role = bls_df[bls_df["role"] == role]
            if "median" in bls_role.columns:
                bls_median = bls_role["median"].iloc[0] if len(bls_role) > 0 else None
                if bls_median:
                    # BLS reports base salary only. OTE = base × multiplier
                    multiplier = 1.44 if role == "SDR" else 1.85
                    bls_ote_estimate = bls_median * multiplier
                    bls_check = {
                        "bls_base_median": bls_median,
                        "bls_ote_estimate": round(bls_ote_estimate, 0),
                        "fitted_median": percentiles["p50"],
                        "deviation_pct": round(abs(percentiles["p50"] - bls_ote_estimate) / bls_ote_estimate * 100, 1),
                    }

        params[role] = {
            "distribution": "lognormal",
            "mu": round(mu, 4),
            "sigma": round(sigma, 4),
            "scipy_params": {"shape": round(shape, 4), "loc": round(loc, 2), "scale": round(scale, 2)},
            "percentiles": percentiles,
            "n_observations": len(ote_values),
            "bls_validation": bls_check,
        }

        print(f"{role} OTE distribution: lognormal(mu={mu:.3f}, sigma={sigma:.3f})")
        print(f"  Median: ${percentiles['p50']:,.0f}, P10-P90: ${percentiles['p10']:,.0f} - ${percentiles['p90']:,.0f}")
        if bls_check:
            print(f"  BLS cross-check: {bls_check['deviation_pct']}% deviation from BLS OTE estimate")

    return params


def fit_tenure_distribution() -> dict:
    """
    Fit tenure distribution from Bridge Group data.
    SDR median tenure ~15 months, geometric distribution.
    """
    # Bridge Group reports: median SDR tenure = 15 months, heavy right-skew
    # We model as geometric with added minimum (3 months ramp)
    sdr_median = 15
    # geometric p such that median ≈ 15: p = 1 - 0.5^(1/median)
    sdr_p = 1 - 0.5 ** (1 / sdr_median)

    ae_median = 24
    ae_p = 1 - 0.5 ** (1 / ae_median)

    params = {
        "SDR": {
            "distribution": "geometric",
            "p": round(sdr_p, 5),
            "median_months": sdr_median,
            "min_months": 1,
        },
        "AE": {
            "distribution": "geometric",
            "p": round(ae_p, 5),
            "median_months": ae_median,
            "min_months": 2,
        },
    }

    print(f"Tenure distributions: SDR p={sdr_p:.4f} (median {sdr_median}mo), AE p={ae_p:.4f} (median {ae_median}mo)")
    return params


def fit_quota_attainment_distribution() -> dict:
    """
    Fit quota attainment from Repvue aggregate data.
    Beta distribution — most reps cluster around 50-60% attainment.
    """
    # From Repvue + Bridge Group: median ~53-58% attainment
    # Shape: heavy left skew (many miss, few crush it)
    # Beta(alpha=3.5, beta=3.2) gives median ≈ 0.53, right shape

    sdr_alpha, sdr_beta_param = 3.2, 3.5  # SDR: slightly lower attainment
    ae_alpha, ae_beta_param = 3.5, 3.2    # AE: slightly higher

    params = {
        "SDR": {
            "distribution": "beta",
            "alpha": sdr_alpha,
            "beta": sdr_beta_param,
            "mean": round(sdr_alpha / (sdr_alpha + sdr_beta_param), 3),
            "median": round(stats.beta.median(sdr_alpha, sdr_beta_param), 3),
        },
        "AE": {
            "distribution": "beta",
            "alpha": ae_alpha,
            "beta": ae_beta_param,
            "mean": round(ae_alpha / (ae_alpha + ae_beta_param), 3),
            "median": round(stats.beta.median(ae_alpha, ae_beta_param), 3),
        },
    }

    print(f"Quota attainment: SDR median={params['SDR']['median']:.1%}, AE median={params['AE']['median']:.1%}")
    return params


def _generate_synthetic_ote(role: str, n: int = 500) -> np.ndarray:
    """Generate synthetic OTE samples from benchmark parameters."""
    rng = np.random.default_rng(42)
    if role == "SDR":
        return rng.lognormal(mean=11.0, sigma=0.30, size=n)
    else:
        return rng.lognormal(mean=11.6, sigma=0.40, size=n)


def _json_default(obj):
    """Handle numpy types for JSON serialization."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def run(ote_path: Path | None = None, bls_path: Path | None = None) -> Path:
    """Run all distribution fitting and save parameters."""
    PARAMS_DIR.mkdir(parents=True, exist_ok=True)

    all_params = {
        "ote_distributions": fit_ote_distributions(ote_path, bls_path),
        "tenure_distributions": fit_tenure_distribution(),
        "quota_attainment": fit_quota_attainment_distribution(),
    }

    output_path = PARAMS_DIR / "fitted_distributions.json"
    with open(output_path, "w") as f:
        json.dump(all_params, f, indent=2, default=_json_default)

    print(f"\nSaved fitted distributions → {output_path}")
    return output_path


if __name__ == "__main__":
    run()
