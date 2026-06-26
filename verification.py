from playwright.sync_api import sync_playwright

def test_plugin_panel():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:5173')

        # Check if the Plugin Manager section exists
        try:
            page.wait_for_selector('h2:has-text("Plugin Manager")', timeout=5000)
            print("Plugin Manager section found.")
        except Exception as e:
            print("Plugin Manager section NOT found.")
            return False

        # Take a screenshot for visual verification
        page.screenshot(path='/home/jules/verification/plugin_panel.png')
        print("Screenshot saved to /home/jules/verification/plugin_panel.png")

        browser.close()
        return True

if __name__ == '__main__':
    test_plugin_panel()
