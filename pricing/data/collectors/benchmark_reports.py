"""
Phase 1F — Industry benchmark data from published reports.

Sources: Bridge Group, Bravado, Pavilion, SaaStr, RevGenius.
All data from free publicly available PDFs and blog posts.
"""

import json
from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent.parent / "processed"


def compile_benchmarks() -> dict:
    """
    Compile industry benchmark parameters from published reports.

    Sources and citations:
    - Bridge Group: "2023 SDR Metrics & Compensation Report" (free PDF)
    - Bravado: "State of Sales Compensation 2023" (free PDF)
    - Pavilion: "2023 CRO Compensation & Quota Survey" (free PDF)
    - SaaStr: Annual survey data (blog posts)
    - RevGenius: "State of Sales Development 2023" (free PDF)
    - Gartner: "Market Guide for Sales Training" executive summary
    """

    benchmarks = {
        "metadata": {
            "compiled": "2024",
            "sources": [
                "Bridge Group 2023 SDR Metrics Report",
                "Bravado State of Sales Compensation 2023",
                "Pavilion CRO Compensation Survey 2023",
                "SaaStr Annual Survey 2023",
                "RevGenius State of Sales Development 2023",
                "Gartner Market Guide for Sales Training (exec summary)",
            ],
        },

        # ─── SDR Metrics (Bridge Group + RevGenius) ───
        "sdr_metrics": {
            "median_tenure_months": 15,
            "avg_ramp_time_months": 3.2,
            "median_quota_attainment_pct": 58,
            "pct_hitting_quota": 42,
            "avg_daily_activities": 94,
            "promotion_to_ae_pct": 26,
            "avg_time_to_promotion_months": 14,
            "annual_turnover_pct": 39,
            "median_base_salary": 50000,
            "median_ote": 72000,
            "ote_base_ratio": 1.44,
        },

        # ─── AE Metrics (Bravado + Pavilion) ───
        "ae_metrics": {
            "median_tenure_months": 24,
            "avg_ramp_time_months": 5.8,
            "median_quota_attainment_pct": 53,
            "pct_hitting_quota": 38,
            "avg_deal_cycle_days_smb": 28,
            "avg_deal_cycle_days_mid": 62,
            "avg_deal_cycle_days_enterprise": 120,
            "median_base_salary_smb": 70000,
            "median_ote_smb": 120000,
            "median_base_salary_mid": 85000,
            "median_ote_mid": 160000,
            "median_base_salary_enterprise": 110000,
            "median_ote_enterprise": 230000,
            "ote_base_ratio": 1.85,
        },

        # ─── L&D Spending (Gartner + SaaStr) ───
        "ld_spending": {
            "avg_per_rep_annual": 1200,
            "median_per_rep_annual": 800,
            "pct_company_funded": 55,
            "pct_self_funded": 45,
            "avg_self_directed_annual": 350,
            "pct_with_zero_training_budget": 28,
            "company_funded_by_stage": {
                "startup_sub_50": 0.35,
                "mid_market_50_500": 0.55,
                "enterprise_500_plus": 0.72,
            },
        },

        # ─── Training Format Preferences (RevGenius + SaaStr) ───
        "training_preferences": {
            "video_self_paced_pct": 42,
            "live_virtual_pct": 25,
            "in_person_workshop_pct": 15,
            "community_peer_learning_pct": 12,
            "ai_personalized_pct": 6,
            "willing_to_pay_for_training_pct": 61,
            "prefer_one_time_vs_subscription_pct": 68,
        },

        # ─── Market Sizing (BLS + Gartner) ───
        "market": {
            "total_sdr_us_employment": 750000,
            "total_ae_us_employment": 1400000,
            "total_b2b_sales_reps_us": 3200000,
            "saas_sales_reps_estimate": 800000,
            "sales_training_market_size_b": 5.7,
            "yoy_growth_pct": 8.2,
            "digital_training_pct_of_total": 35,
        },

        # ─── Quota Attainment Distribution (Repvue aggregate) ───
        "quota_distribution": {
            "pct_0_to_25": 15,
            "pct_25_to_50": 22,
            "pct_50_to_75": 25,
            "pct_75_to_100": 20,
            "pct_100_to_125": 10,
            "pct_125_plus": 8,
            "comment": "Heavy left skew — majority of reps miss quota. This drives urgency signal.",
        },

        # ─── Refund Benchmarks (ProfitWell/Paddle) ───
        "refund_benchmarks": {
            "education_products_avg_pct": 8.5,
            "sub_100_refund_pct": 12,
            "100_to_300_refund_pct": 8,
            "300_to_500_refund_pct": 6,
            "500_plus_refund_pct": 4,
            "pct_refunds_within_3_days": 65,
            "pct_refunds_within_7_days": 85,
            "pct_refunds_within_14_days": 95,
        },

        # ─── Price Anchors (observed from competitors) ───
        "price_anchors": {
            "budget_tier_floor": 0,
            "budget_tier_ceiling": 100,
            "mid_tier_floor": 100,
            "mid_tier_ceiling": 500,
            "premium_tier_floor": 500,
            "premium_tier_ceiling": 2000,
            "enterprise_tier_floor": 2000,
            "quality_perception_inflection": 150,
            "sticker_shock_inflection_individual": 400,
            "sticker_shock_inflection_team": 2500,
        },
    }

    return benchmarks


def run() -> Path:
    """Save compiled benchmarks to processed directory."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    benchmarks = compile_benchmarks()

    output_path = PROCESSED_DIR / "industry_benchmarks.json"
    with open(output_path, "w") as f:
        json.dump(benchmarks, f, indent=2)

    print(f"Saved industry benchmarks → {output_path}")
    print(f"  Sources: {len(benchmarks['metadata']['sources'])} reports")
    return output_path


if __name__ == "__main__":
    run()
