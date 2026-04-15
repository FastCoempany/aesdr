"""
Phase 3C — Discrete choice simulation (multinomial logit).

For each respondent, simulates their purchase decision given AESDR prices.
Options: buy_individual, buy_team, buy_competitor, do_nothing.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd

PARAMS_DIR = Path(__file__).resolve().parent.parent / "calibration"
OUTPUT_DIR = Path(__file__).resolve().parent


def sigmoid(x, midpoint, steepness):
    return 1 / (1 + np.exp(-steepness * (x - midpoint)))


def quality_perception(price: float) -> float:
    """
    Spence signaling model: price as quality signal.
    Below $50 → skepticism, $150-300 → sweet spot, above $400 → sticker shock.
    """
    quality = sigmoid(price, 150, 0.03)
    shock = 1 - sigmoid(price, 400, 0.02)
    return float(quality * shock)


def load_competitor_params() -> dict:
    """Load competitor substitution parameters."""
    path = PARAMS_DIR / "competitor_params.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}


def simulate_choice(
    respondent: dict,
    individual_price: float,
    team_price: float,
    competitor_params: dict | None = None,
    rng: np.random.Generator | None = None,
) -> str:
    """
    Simulate purchase decision for a single respondent.

    Returns: 'buy_individual', 'buy_team', 'buy_competitor', 'do_nothing'

    Uses multinomial logit (Gumbel-distributed noise → logit choice probabilities).
    """
    if rng is None:
        rng = np.random.default_rng()

    wtp = respondent["wtp"]
    role = respondent["role"]
    company_reimburse = respondent["company_will_reimburse"]

    # Scale factor for utility (controls randomness)
    mu = 0.02  # Higher = more deterministic

    # ── Utility of AESDR Individual ──
    price = individual_price
    u_individual = (
        wtp
        - price
        + quality_perception(price) * 50   # Quality signal bonus (up to $50 value)
        + 30                                # Brand/uniqueness premium (confession sequence, etc.)
        + (20 if role == "SDR" else 15)     # Feature match bonus
    )

    # ── Utility of AESDR Team ──
    if company_reimburse:
        # Team value: they care about per-seat cost vs individual
        per_seat = team_price / 10
        team_premium = 40  # Dashboard, progress tracking, shared accountability
        u_team = (
            wtp * 0.3  # Individual share of team utility
            - per_seat
            + team_premium
            + quality_perception(team_price / 10) * 30
        )
    else:
        u_team = -1000  # Not an option for self-funded individuals

    # ── Utility of best competitor ──
    substitution = {}
    if competitor_params:
        substitution = competitor_params.get("substitution_matrix", {})

    best_competitor_utility = -500  # Default: no known competitor is attractive
    num_aware = respondent.get("num_competitors_aware_of", 2)

    competitor_utilities = []
    for comp_name, comp in substitution.items():
        if comp_name == "do_nothing":
            continue

        p_aware = comp.get("prob_aware", 0.1)
        # Simulate awareness (stochastic)
        if rng.random() > p_aware:
            continue

        comp_price = comp.get("effective_price", 100)
        comp_quality = quality_perception(comp_price) * 30  # Competitors get lower quality signal
        u_comp = wtp * 0.5 - comp_price + comp_quality  # Competitors capture less of WTP

        competitor_utilities.append(u_comp)

    if competitor_utilities:
        best_competitor_utility = max(competitor_utilities)

    # ── Utility of do nothing ──
    # Base utility of $0 but with implicit cost of not training
    # Missing quota → higher implicit cost of inaction
    quota = respondent.get("quota_attainment", 0.5)
    implicit_cost = 0
    if quota < 0.5:
        # Missing quota badly → "doing nothing" is painful
        implicit_cost = (0.5 - quota) * 200  # Up to $100 implicit cost
    u_nothing = -implicit_cost

    # ── Gumbel noise (gives multinomial logit) ──
    noise_scale = 50  # Controls randomness of choices
    noise = rng.gumbel(0, noise_scale, size=4)

    utilities = np.array([u_individual, u_team, best_competitor_utility, u_nothing]) + noise
    choices = ["buy_individual", "buy_team", "buy_competitor", "do_nothing"]

    return choices[np.argmax(utilities)]


def simulate_market(
    population_df: pd.DataFrame,
    sdr_price: float,
    ae_price: float,
    team_price: float,
    seed: int = 42,
) -> dict:
    """
    Run choice simulation across entire population at given prices.

    Returns market outcome metrics.
    """
    rng = np.random.default_rng(seed)
    competitor_params = load_competitor_params()

    choices = []
    for _, respondent in population_df.iterrows():
        r = respondent.to_dict()
        individual_price = sdr_price if r["role"] == "SDR" else ae_price

        choice = simulate_choice(r, individual_price, team_price, competitor_params, rng)
        choices.append(choice)

    population_df = population_df.copy()
    population_df["choice"] = choices

    # ── Compute metrics ──
    n = len(population_df)

    # Revenue
    revenue = 0
    for _, row in population_df.iterrows():
        if row["choice"] == "buy_individual":
            revenue += sdr_price if row["role"] == "SDR" else ae_price
        elif row["choice"] == "buy_team":
            revenue += team_price

    # Conversion rates
    buyers = population_df[population_df["choice"].str.startswith("buy")]
    individual_buyers = population_df[population_df["choice"] == "buy_individual"]
    team_buyers = population_df[population_df["choice"] == "buy_team"]

    overall_conversion = len(buyers) / n if n > 0 else 0
    sdr_conversion = (
        len(individual_buyers[individual_buyers["role"] == "SDR"])
        / len(population_df[population_df["role"] == "SDR"])
        if len(population_df[population_df["role"] == "SDR"]) > 0 else 0
    )
    ae_conversion = (
        len(individual_buyers[individual_buyers["role"] == "AE"])
        / len(population_df[population_df["role"] == "AE"])
        if len(population_df[population_df["role"] == "AE"]) > 0 else 0
    )

    # Choice distribution
    choice_dist = population_df["choice"].value_counts(normalize=True).to_dict()

    return {
        "prices": {"sdr": sdr_price, "ae": ae_price, "team": team_price},
        "revenue": round(revenue, 2),
        "revenue_per_visitor": round(revenue / n, 2) if n > 0 else 0,
        "overall_conversion": round(overall_conversion, 4),
        "sdr_conversion": round(sdr_conversion, 4),
        "ae_conversion": round(ae_conversion, 4),
        "team_conversion": round(len(team_buyers) / n, 4) if n > 0 else 0,
        "choice_distribution": {k: round(v, 4) for k, v in choice_dist.items()},
        "n_respondents": n,
        "total_individual_buyers": len(individual_buyers),
        "total_team_buyers": len(team_buyers),
    }


def run_price_sweep(
    population_df: pd.DataFrame,
    sdr_prices: list[float] | None = None,
    ae_prices: list[float] | None = None,
    team_prices: list[float] | None = None,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Sweep across price combinations and record market outcomes.
    Used for demand curve estimation and Pareto frontier discovery.
    """
    if sdr_prices is None:
        sdr_prices = [79, 99, 129, 149, 179, 199, 249, 299]
    if ae_prices is None:
        ae_prices = [99, 149, 179, 199, 249, 299, 349, 399]
    if team_prices is None:
        team_prices = [499, 699, 799, 999, 1299, 1499, 1999]

    results = []
    total_combos = len(sdr_prices) * len(ae_prices) * len(team_prices)
    print(f"Running price sweep: {total_combos} combinations...")

    count = 0
    for sp in sdr_prices:
        for ap in ae_prices:
            if ap < sp:
                continue  # AE price must be >= SDR price
            for tp in team_prices:
                if tp < sp * 3 or tp > sp * 10:
                    continue  # Team must be 3-10x individual
                outcome = simulate_market(population_df, sp, ap, tp, seed=seed + count)
                outcome["sdr_price"] = sp
                outcome["ae_price"] = ap
                outcome["team_price"] = tp
                results.append(outcome)
                count += 1

                if count % 50 == 0:
                    print(f"  {count}/{total_combos} combinations evaluated...")

    df = pd.DataFrame(results)
    print(f"Completed: {len(df)} valid price combinations evaluated")
    return df


if __name__ == "__main__":
    from simulation.respondent_generator import run as generate_population
    pop_path = generate_population(n=5000)

    if pop_path.suffix == ".parquet":
        pop = pd.read_parquet(pop_path)
    else:
        pop = pd.read_csv(pop_path)

    # Quick test at current prices
    result = simulate_market(pop, sdr_price=199, ae_price=199, team_price=999)
    print("\nMarket simulation at $199/$199/$999:")
    for k, v in result.items():
        print(f"  {k}: {v}")
