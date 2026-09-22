"""Light-theme regressions: real controls, readable surfaces, responsive content."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--output',required=True);p.add_argument('--wait-for-publish',action='store_true');a=p.parse_args()
out=Path(a.output);out.mkdir(parents=True,exist_ok=True);checks=[];errors=[]
def check(name,value):
    checks.append({'name':name,'passed':bool(value)})
    assert value,name
with sync_playwright() as playwright:
    browser=playwright.chromium.launch()
    page=browser.new_page(viewport={'width':1536,'height':1024},reduced_motion='no-preference')
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        for attempt in range(25 if a.wait_for_publish else 1):
            url=a.url.split('#')[0].split('?')[0]+'?v=6.0.0&verify='+str(attempt)
            response=page.goto(url,wait_until='networkidle')
            if page.locator('body').get_attribute('data-design-version')=='6.0.0':break
            time.sleep(10)
        check('Published light release loads',response.status==200 and page.locator('body').get_attribute('data-design-version')=='6.0.0')
        page.locator('#reject-cookies').click();page.wait_for_timeout(1200)
        check('Bright hero and header',page.locator('.hero').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(255, 255, 255)' and page.locator('.site-header').evaluate('e=>getComputedStyle(e).color')=='rgb(23, 46, 50)')
        check('No galaxy or cinematic canvases',page.locator('canvas,.cinema-section,.journey-nav').count()==0)
        check('Physical equipment image loads',page.locator('.hero-equipment img').evaluate('i=>i.complete&&i.naturalWidth>0'))
        image=page.locator('.hero-equipment img')
        start=image.evaluate('e=>getComputedStyle(e).transform');page.wait_for_timeout(500)
        check('Gentle idle motion changes rendered equipment',start!=image.evaluate('e=>getComputedStyle(e).transform'))
        page.get_by_role('button',name='Pause motion',exact=True).click();page.wait_for_timeout(80)
        start=image.evaluate('e=>getComputedStyle(e).transform');page.wait_for_timeout(350)
        check('Manual pause freezes equipment',start==image.evaluate('e=>getComputedStyle(e).transform'))
        page.get_by_role('button',name='Resume motion',exact=True).press('Enter')
        check('Keyboard resumes gentle motion',page.locator('.gentle-motion').get_attribute('aria-pressed')=='false')
        page.emulate_media(reduced_motion='reduce')
        check('Reduced motion disables decorative animation',image.evaluate('e=>getComputedStyle(e).animationName')=='none')
        page.screenshot(path=str(out/'desktop.png'))
        page.locator('#compliance [data-compliance]').first.click()
        check('Compliance action opens relevant request',page.locator('#quote-dialog').is_visible() and 'certification scope' in page.locator('#q-notes').input_value() and 'Data destruction' in page.locator('#q-service').input_value())
        page.locator('#quote-dialog [data-close]').click()
        page.locator('.assurance-row').first.click()
        check('Data handling row opens correct service','Data destruction' in page.locator('#content-title').inner_text())
        page.locator('#content-dialog [data-close]').click()
        page.locator('.assurance-row').nth(2).click()
        check('Reporting row opens documentation request',page.locator('#quote-dialog').is_visible() and 'documentation' in page.locator('#q-notes').input_value())
        page.locator('#quote-dialog [data-close]').click()
        check('Credentials clearly await evidence','pending verification' in page.locator('.credential-status').inner_text())
        check('Customer stories await evidence without invented numbers','in preparation' in page.locator('#customer-stories').inner_text() and not any(c.isdigit() for c in page.locator('#customer-stories').inner_text()))
        page.locator('#customer-stories [data-quote]').click()
        check('Outcome action opens usable quote form',page.locator('#quote-step-1').is_visible())
        page.locator('#quote-dialog [data-close]').click()
        for section in ['services','compliance','customer-stories','process','portal','sustainability','industries','contact']:
            page.locator('#'+section).scroll_into_view_if_needed();page.wait_for_timeout(100)
            page.locator('#'+section).screenshot(path=str(out/(section+'.png')))
        check('All content images load',page.evaluate('()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)'))
        for width,height in [(1920,1080),(1280,720),(768,1024),(390,844),(320,740)]:
            page.set_viewport_size({'width':width,'height':height})
            page.get_by_role('link',name='Phoenix Tech Refresh home',exact=True).first.click()
            check(f'No horizontal overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            check(f'Hero text fits at {width}px',page.locator('h1').evaluate('e=>e.scrollWidth<=e.clientWidth+1'))
            if width==390:
                page.screenshot(path=str(out/'mobile.png'))
                check('Mobile equipment source is the complete product photo','equipment-light' in image.evaluate('i=>i.currentSrc'))
                page.get_by_role('button',name='Open navigation',exact=True).click()
                page.locator('#mega-menu a[href="#industries"]').click()
                check('Mobile menu routes and closes',page.url.endswith('#industries') and not page.locator('#mega-menu').is_visible())
                page.locator('#compliance').screenshot(path=str(out/'mobile-compliance.png'))
                page.locator('#customer-stories').screenshot(path=str(out/'mobile-outcomes.png'))
        page.set_viewport_size({'width':1440,'height':1100})
        page.locator('.site-footer').scroll_into_view_if_needed()
        page.locator('.site-footer a[href="#/legal/privacy"]').click()
        page.locator('#content-dialog').wait_for(state='visible')
        check('Footer privacy dialog stays reachable',page.locator('#content-dialog').is_visible())
        check('No JavaScript runtime errors',not errors)
    finally:
        (out/'results.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2));print(json.dumps({'passed':sum(c['passed'] for c in checks),'total':len(checks),'errors':errors}));browser.close()
