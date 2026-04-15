"""
Phase 3A + 3B — Synthetic respondent generation using Monte Carlo with Gaussian copula.

Generates a population of 10,000 synthetic sales professionals with
correlated attributes sampled from calibrated distributions.
"""

import json
from dataclasses import dataclass, asdict
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

PARAMS_DIR = Path(__file__).resolve().parent.parent / "calibration"
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"
OUTPUT_DIR = Path(__file__).resolve().parent


@dataclass
class SyntheticRespondent:
    # Demographics
    role: str                      # 'SDR' or 'AE'
    ote: float                     # On-target earnings
    yoe: float                     # Years of experience
    company_stage: str             # 'startup', 'mid_market', 'enterprise'
    geography: str                 # 'high_col', 'medium_col', 'low_col'

    # Behavioral
    quota_attainment: float        # 0.0 to 1.5+
    months_in_current_role: int
    prior_training_spend: float
    num_competitors_aware_of: int

    # Psychographic (derived)
    urgency: float
    price_sensitivity: float
    quality_skepticism: float
    company_will_reimburse: bool

    # Computed
    wtp: float                     # Willingness to pay
    purchase_probability: float    # P(buy | price) — set during choice simulation


def load_params() -> dict:
    """Load all calibrated parameters."""
    params = {}

    for fname in ["fitted_distributions.json", "elasticity_params.json", "competitor_params.json"]:
        fpath = PARAMS_DIR / fname
        if fpath.exists():
            with open(fpath) as f:
                params[fname.replace(".json", "")] = json.load(f)

    benchmarks_path = DATA_DIR / "industry_benchmarks.json"
    if benchmarks_path.exists():
        with open(benchmarks_path) as f:
            params["benchmarks"] = json.load(f)

    return params


def generate_correlated_uniforms(n: int, rng: np.random.Generator) -> np.ndarray:
    """
    Generate correlated uniform variables using Gaussian copula.

    Correlation structure encodes real-world relationships:
    - OTE ↔ company_stage: 0.45 (enterprise pays more)
    - YOE ↔ OTE: 0.55 (experience → higher comp)
    - company_stage ↔ reimburse: 0.60 (enterprise funds more training)
    - quota_attainment ↔ urgency: -0.70 (missing quota → desperate)
    - OTE ↔ geography_col: 0.50 (high CoL metros = higher pay)
    """
    # Variables: [ote, yoe, company_stage, geography, quota, tenure, training_spend,
    #             competitors_aware, reimburse]
    n_vars = 9

    # Correlation matrix (lower triangle)
    corr = np.eye(n_vars)
    # ote(0) ↔ yoe(1)
    corr[0, 1] = corr[1, 0] = 0.55
    # ote(0) ↔ company_stage(2)
    corr[0, 2] = corr[2, 0] = 0.45
    # ote(0) ↔ geography(3)
    corr[0, 3] = corr[3, 0] = 0.50
    # company_stage(2) ↔ reimburse(8)
    corr[2, 8] = corr[8, 2] = 0.60
    # quota(4) ↔ tenure(5) — longer tenure → slightly higher attainment
    corr[4, 5] = corr[5, 4] = 0.25
    # yoe(1) ↔ company_stage(2) — more experience → larger companies
    corr[1, 2] = corr[2, 1] = 0.35
    # training_spend(6) ↔ company_stage(2)
    corr[2, 6] = corr[6, 2] = 0.30
    # competitors_aware(7) ↔ yoe(1) — more experienced = more market awareness
    corr[1, 7] = corr[7, 1] = 0.25

    # Ensure positive semi-definite
    eigenvalues, eigenvectors = np.linalg.eigh(corr)
    eigenvalues = np.maximum(eigenvalues, 1e-8)
    corr = eigenvectors @ np.diag(eigenvalues) @ eigenvectors.T
    # Re-normalize diagonal to 1
    d = np.sqrt(np.diag(corr))
    corr = corr / np.outer(d, d)

    # Sample from multivariate normal
    z = rng.multivariate_normal(np.zeros(n_vars), corr, size=n)

    # Transform to uniform via CDF (Gaussian copula)
    u = stats.norm.cdf(z)

    return u


def generate_population(n: int = 10000, seed: int = 42) -> list[SyntheticRespondent]:
    """Generate n synthetic respondents from calibrated distributions."""
    rng = np.random.default_rng(seed)
    params = load_params()

    # Get distribution parameters
    dist_params = params.get("fitted_distributions", {})
    elasticity_params = params.get("elasticity_params", {})
    benchmarks = params.get("benchmarks", {})

    # OTE distribution parameters
    sdr_ote = dist_params.get("ote_distributions", {}).get("SDR", {})
    ae_ote = dist_params.get("ote_distributions", {}).get("AE", {})
    sdr_mu = sdr_ote.get("mu", 11.0)
    sdr_sigma = sdr_ote.get("sigma", 0.30)
    ae_mu = ae_ote.get("mu", 11.6)
    ae_sigma = ae_ote.get("sigma", 0.40)

    # Generate correlated uniforms
    u = generate_correlated_uniforms(n, rng)

    # Role assignment: ~55% SDR, 45% AE (from BLS employment ratio)
    role_split = 0.55
    roles = np.where(rng.random(n) < role_split, "SDR", "AE")

    respondents = []

    for i in range(n):
        role = roles[i]
        u_i = u[i]

        # ── OTE (from lognormal via copula) ──
        if role == "SDR":
            ote = float(stats.lognorm.ppf(u_i[0], s=sdr_sigma, scale=np.exp(sdr_mu)))
        else:
            ote = float(stats.lognorm.ppf(u_i[0], s=ae_sigma, scale=np.exp(ae_mu)))

        # ── YOE (geometric-ish, min 0.5) ──
        if role == "SDR":
            yoe = max(0.5, float(stats.expon.ppf(u_i[1], scale=1.8)))  # median ~1.2 years
        else:
            yoe = max(0.5, float(stats.expon.ppf(u_i[1], scale=3.5)))  # median ~2.4 years

        # ── Company stage (categorical from uniform) ──
        cs_u = u_i[2]
        if cs_u < 0.30:
            company_stage = "startup"
        elif cs_u < 0.65:
            company_stage = "mid_market"
        else:
            company_stage = "enterprise"

        # ── Geography (cost of living) ──
        geo_u = u_i[3]
        if geo_u < 0.25:
            geography = "high_col"
        elif geo_u < 0.65:
            geography = "medium_col"
        else:
            geography = "low_col"

        # ── Quota attainment (beta distribution) ──
        qa_params = dist_params.get("quota_attainment", {}).get(role, {})
        qa_alpha = qa_params.get("alpha", 3.2 if role == "SDR" else 3.5)
        qa_beta = qa_params.get("beta", 3.5 if role == "SDR" else 3.2)
        quota_attainment = float(stats.beta.ppf(u_i[4], qa_alpha, qa_beta))

        # ── Months in current role (geometric) ──
        tenure_params = dist_params.get("tenure_distributions", {}).get(role, {})
        median_tenure = tenure_params.get("median_months", 15 if role == "SDR" else 24)
        months_in_role = max(1, int(stats.expon.ppf(u_i[5], scale=median_tenure * 0.7)))

        # ── Prior training spend (mixture: 28% spent $0, rest lognormal) ──
        if u_i[6] < 0.28:
            prior_training = 0.0
        else:
            adjusted_u = (u_i[6] - 0.28) / 0.72
            prior_training = float(stats.lognorm.ppf(max(0.001, min(0.999, adjusted_u)), s=0.8, scale=200))

        # ── Competitors aware of (Poisson λ=2) ──
        num_competitors = min(8, int(stats.poisson.ppf(min(0.999, u_i[7]), mu=2)))

        # ── Company reimbursement (Bernoulli, correlated with company_stage) ──
        reimburse_probs = {"startup": 0.35, "mid_market": 0.55, "enterprise": 0.72}
        reimburse_prob = reimburse_probs.get(company_stage, 0.50)
        company_will_reimburse = u_i[8] < reimburse_prob

        # ── Derived: Urgency ──
        # U-shaped: high for new reps, drops, rises again for stagnation
        new_boost = 0.5 * np.exp(-months_in_role / 4.0)
        stagnation_boost = 0.4 / (1 + np.exp(-0.3 * (months_in_role - 18)))
        urgency = 0.7 + new_boost + stagnation_boost
        # Quota miss amplifies urgency
        if quota_attainment < 0.5:
            urgency *= 1.0 + (0.5 - quota_attainment)

        # ── Derived: Price sensitivity ──
        # Higher income → less price sensitive; company funding → less sensitive
        median_ote = 72000 if role == "SDR" else 155000
        income_factor = (ote / median_ote) ** 0.6
        col_multiplier = {"high_col": 0.85, "medium_col": 1.0, "low_col": 1.15}[geography]
        reimburse_factor = 0.5 if company_will_reimburse else 1.0
        price_sensitivity = col_multiplier * reimburse_factor / income_factor

        # ── Derived: Quality skepticism ──
        # More prior spend + more alternatives awareness = more skeptical
        skepticism_base = 0.3
        if prior_training > 0:
            skepticism_base += 0.2  # "Been burned before"
        skepticism_base += num_competitors * 0.05
        quality_skepticism = min(1.0, skepticism_base)

        # ── Compute WTP ──
        wtp_components = elasticity_params.get("wtp_function_components", {})
        base_wtp_data = elasticity_params.get("base_wtp", {})

        base = base_wtp_data.get(role, {}).get("base_wtp", 135 if role == "SDR" else 195)
        wtp = (
            base
            * income_factor
            * urgency
            * (1 - 0.06 * min(num_competitors, 8))  # competitor drag
            * (2.0 if company_will_reimburse else 1.0)  # L&D multiplier
        )

        # Add noise (±15%)
        wtp *= (1 + rng.normal(0, 0.15))
        wtp = max(10, wtp)  # Floor at $10

        respondents.append(SyntheticRespondent(
            role=role,
            ote=round(ote, 0),
            yoe=round(yoe, 1),
            company_stage=company_stage,
            geography=geography,
            quota_attainment=round(quota_attainment, 3),
            months_in_current_role=months_in_role,
            prior_training_spend=round(prior_training, 0),
            num_competitors_aware_of=num_competitors,
            urgency=round(urgency, 3),
            price_sensitivity=round(price_sensitivity, 3),
            quality_skepticism=round(quality_skepticism, 3),
            company_will_reimburse=company_will_reimburse,
            wtp=round(wtp, 2),
            purchase_probability=0.0,  # Set during choice simulation
        ))

    return respondents


def population_to_dataframe(respondents: list[SyntheticRespondent]) -> pd.DataFrame:
    """Convert respondent list to DataFrame."""
    return pd.DataFrame([asdict(r) for r in respondents])


def run(n: int = 10000, seed: int = 42) -> Path:
    """Generate synthetic population and save."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Generating {n:,} synthetic respondents (seed={seed})...")
    respondents = generate_population(n, seed)
    df = population_to_dataframe(respondents)

    # Summary stats
    for role in ["SDR", "AE"]:
        subset = df[df["role"] == role]
        print(f"\n{role} ({len(subset):,} respondents):")
        print(f"  OTE: median=${subset['ote'].median():,.0f}, mean=${subset['ote'].mean():,.0f}")
        print(f"  WTP: median=${subset['wtp'].median():,.0f}, mean=${subset['wtp'].mean():,.0f}")
        print(f"  Quota attainment: median={subset['quota_attainment'].median():.1%}")
        print(f"  Company reimburse: {subset['company_will_reimburse'].mean():.1%}")
        print(f"  Urgency: median={subset['urgency'].median():.2f}")

    output_path = OUTPUT_DIR / "synthetic_population.parquet"
    try:
        df.to_parquet(output_path, index=False)
    except Exception:
        output_path = OUTPUT_DIR / "synthetic_population.csv"
        df.to_csv(output_path, index=False)

    print(f"\nSaved population → {output_path}")
    return output_path


if __name__ == "__main__":
    import sys
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
    run(n=n)
