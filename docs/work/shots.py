"""Drives the running app in Edge and saves the screenshots used in the report and deck."""
import json
import urllib.request

from playwright.sync_api import sync_playwright

APP = "http://localhost:5173"
API = "http://localhost:8000"
OUT = "figs"


def call(method, path, body=None, token=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def seed_user():
    try:
        res = call("POST", "/api/auth/register", {"email": "demo@swiperight.dev", "password": "demo-pass-123", "fullName": "Jeh Dadina"})
    except Exception:
        res = call("POST", "/api/auth/login", {"email": "demo@swiperight.dev", "password": "demo-pass-123"})
    token = res["token"]
    if not call("GET", "/api/expenses", token=token):
        rows = [
            ("Swiggy order", 640, "Dining", "2026-10-02"), ("Zomato dinner", 1120, "Dining", "2026-10-09"),
            ("Cafe Coffee Day", 380, "Dining", "2026-10-14"), ("HP Petrol Pump", 3200, "Fuel", "2026-10-05"),
            ("Indian Oil", 2800, "Fuel", "2026-10-19"), ("IRCTC ticket", 2450, "Travel", "2026-10-11"),
            ("Uber ride", 540, "Travel", "2026-10-21"), ("Amazon purchase", 5400, "Shopping", "2026-10-07"),
            ("Myntra", 3100, "Shopping", "2026-10-16"), ("BigBasket", 4200, "Groceries", "2026-10-03"),
            ("Netflix", 649, "Subscriptions", "2026-10-06"), ("Airtel postpaid", 799, "Utilities", "2026-10-08"),
        ]
        for m, a, c, d in rows:
            call("POST", "/api/expenses", {"merchant": m, "amount": a, "category": c, "date": d}, token)
    return res


def set_range(page, label, value):
    page.evaluate(
        """([label, value]) => {
          const el = document.querySelector(`input[aria-label="${label}"]`);
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          set.call(el, String(value));
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }""",
        [label, value],
    )


def main():
    auth = seed_user()
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()

        page.goto(APP)
        page.wait_for_timeout(2500)
        page.screenshot(path=f"{OUT}/ui_landing.png")

        # Dashboard: manual mode, set sliders, rank
        page.goto(f"{APP}/dashboard")
        page.wait_for_timeout(1200)
        page.get_by_role("button", name="Manual Entry").click()
        for cat, amt in [("Dining", 90000), ("Travel", 120000), ("Fuel", 48000), ("Shopping", 150000), ("Groceries", 60000)]:
            set_range(page, f"{cat} yearly spend", amt)
        page.get_by_role("button", name="Get Recommendations").click()
        page.wait_for_selector("text=Your best match", timeout=15000)
        page.wait_for_timeout(2500)
        page.screenshot(path=f"{OUT}/ui_dashboard.png")
        page.get_by_text("Swipe through your top 5").scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        page.screenshot(path=f"{OUT}/ui_dashboard_deck.png")

        # Card directory
        page.goto(f"{APP}/cards")
        page.wait_for_selector("text=Card Directory")
        page.wait_for_timeout(2000)
        page.screenshot(path=f"{OUT}/ui_cards.png")

        # Signed-in expenses page
        ctx2 = browser.new_context(viewport={"width": 1440, "height": 900})
        page2 = ctx2.new_page()
        page2.goto(APP)
        page2.evaluate("t => localStorage.setItem('swiperight_token', t)", auth["token"])
        page2.goto(f"{APP}/expenses")
        page2.wait_for_selector("text=Recent expenses")
        page2.wait_for_timeout(1500)
        page2.screenshot(path=f"{OUT}/ui_expenses.png")

        # Rank from own expenses
        page2.goto(f"{APP}/dashboard?source=expenses")
        page2.wait_for_timeout(1000)
        page2.get_by_role("button", name="Rank cards from my expenses").click()
        page2.wait_for_selector("text=Your best match", timeout=15000)
        page2.wait_for_timeout(2500)
        page2.screenshot(path=f"{OUT}/ui_dashboard_expenses.png")

        # Mobile view of the dashboard
        mob = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        pm = mob.new_page()
        pm.goto(f"{APP}/cards")
        pm.wait_for_selector("text=Card Directory")
        pm.wait_for_timeout(1500)
        pm.screenshot(path=f"{OUT}/ui_mobile_cards.png")
        browser.close()
    print("screenshots saved")


if __name__ == "__main__":
    main()
