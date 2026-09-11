"""Browser checks for the animation and its public Pages entry point.
Run against a URL (real browser navigation), or --html for isolated local QA.
Test output and screenshots go outside the source tree. No inquiries are sent.
"""
from pathlib import Path
import argparse, json, math, os, time, urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
source = parser.add_mutually_exclusive_group(required=True)
source.add_argument('--url')
source.add_argument('--html')
parser.add_argument('--output', required=True)
parser.add_argument('--wait-for-publish', action='store_true')
args = parser.parse_args()
out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
VERSION = '4.0.0'
checks = []
def check(name, condition):
    checks.append({'name': name, 'passed': bool(condition)})
    assert condition, name

if args.url and args.wait_for_publish:
    deadline = time.monotonic() + 300
    while True:
        try:
            url = args.url + ('&' if '?' in args.url else '?') + 'verify=' + str(time.time_ns())
            with urllib.request.urlopen(url, timeout=20) as r:
                html = r.read().decode('utf-8')
            if f'motion.js?v={VERSION}' in html and f'motion.css?v={VERSION}' in html:
                break
        except Exception as e:
            print('Waiting for Pages:', str(e)[:160], flush=True)
        if time.monotonic() >= deadline:
            raise RuntimeError('Published entry point has not updated to Phoenix Galaxy.')
        time.sleep(10)

with sync_playwright() as p:
    launch = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'): launch['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**launch)
    context = browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='no-preference')
    page = context.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    def load(target):
        if args.html:
            # A fresh document is required to test reload; set_content alone keeps window globals.
            target.goto('about:blank')
            target.set_content(Path(args.html).read_text(), wait_until='load')
        else:
            response = target.goto(args.url, wait_until='networkidle')
            check('Published HTTP response', response.status == 200)
    def status(): return page.evaluate('window.PTR_MOTION.status')
    def digest(target=page): return target.evaluate("""()=>{const c=document.querySelector('.hero canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=197)h=(Math.imul(h,31)+d[i])|0;return h;}""")
    try:
        load(page)
        page.wait_for_function(f'window.PTR_MOTION?.version === "{VERSION}"')
        check('Correct page identity', 'Phoenix Tech Refresh' in page.title())
        check('Homepage content preserved', 'Your technology’s' in page.locator('h1').inner_text())
        check('Three animation surfaces', page.locator('canvas.ambient-canvas').count() == 3)
        check('Three scene initializations succeeded', all(not s['failed'] for s in status()['scenes']))
        check('Canvas is behind accessible content', page.locator('.hero canvas').get_attribute('aria-hidden') == 'true')
        if args.url:
            check('Exactly one motion script', page.locator('script[src*="motion.js"]').count() == 1)
            check('Exactly one motion stylesheet', page.locator('link[href*="motion.css"]').count() == 1)
        if page.locator('#reject-cookies').is_visible(): page.locator('#reject-cookies').click()
        page.wait_for_timeout(4700)
        a, pixels = status()['frames'], digest()
        page.wait_for_timeout(850)
        check('Animation frames advance', status()['frames'] > a)
        check('Actual canvas pixels change', digest() != pixels)
        check('Animation running', status()['running'])
        origin=status()['scenes'][0]['driftSample']
        page.wait_for_timeout(2000)
        distance=math.dist(origin,status()['scenes'][0]['driftSample'])
        check('Logo particles move slowly without input', .25 < distance < 16)
        check('Logo pixels loaded from the real mark', status()['logoPoints'] > 1000 and status()['shape'] == 'logo-pixels')
        visual=page.locator('.hero-visual').bounding_box()
        height=visual['height']-35
        size=min(visual['width']*.88,height*.88)
        x=visual['x']+visual['width']*.5-size*.1
        y=visual['y']+height*.49-size*.40
        page.mouse.move(x,y);page.wait_for_timeout(650)
        check('Mouse passes through and scatters logo pixels', status()['scenes'][0]['affected'] > 0 and status()['scenes'][0]['displacement'] > 10)
        page.screenshot(path=str(out/'desktop-interaction.png'))
        page.mouse.move(10,10);page.wait_for_timeout(2400)
        check('Scattered pixels return to the logo', status()['scenes'][0]['displacement'] < 5)
        page.locator('.motion-control').click();page.wait_for_timeout(100)
        a,pixels=status()['frames'],digest();page.wait_for_timeout(400)
        check('Pause stops scheduling', not status()['running'])
        check('Pause freezes frames and pixels', status()['frames']==a and digest()==pixels)
        page.screenshot(path=str(out/'desktop-paused.png'))
        page.locator('.motion-control').click();page.wait_for_timeout(250)
        check('Resume restarts motion', status()['running'] and status()['frames']>a)
        page.locator('[data-quote]').first.click();page.wait_for_timeout(100)
        check('Quote control still opens dialog', page.locator('#quote-dialog').evaluate('(d)=>d.open'))
        check('Background suspends behind dialog', not status()['running'])
        page.locator('#quote-next').click()
        check('Form validation retained', page.locator('#quote-step-1').is_visible())
        page.locator('#quote-dialog [data-close]').click();page.wait_for_timeout(150)
        check('Closing dialog restores motion', status()['running'])
        page.emulate_media(reduced_motion='reduce');page.wait_for_timeout(100)
        a,pixels=status()['frames'],digest();page.wait_for_timeout(400)
        check('Autoplay continues with reduced motion enabled', status()['running'] and status()['frames'] > a and digest()!=pixels)
        page.locator('.motion-control').press('Space');page.wait_for_timeout(100)
        a,pixels=status()['frames'],digest();page.wait_for_timeout(300)
        check('Manual keyboard pause still freezes frames and pixels', not status()['running'] and status()['frames']==a and digest()==pixels)
        page.emulate_media(reduced_motion='no-preference');page.wait_for_timeout(100)
        check('System changes do not override manual pause', not status()['running'])
        page.locator('.motion-control').press('Enter');page.wait_for_timeout(150)
        check('Keyboard resume restores playback', status()['running'])
        page.locator('.service-row').nth(2).click()
        check('Service explorer still responds', page.locator('.service-row').nth(2).get_attribute('aria-pressed')=='true')
        page.locator('#process').scroll_into_view_if_needed();page.wait_for_timeout(200)
        page.locator('.process-tab').nth(2).click()
        check('Lifecycle tabs still respond', page.locator('.process-tab').nth(2).get_attribute('aria-selected')=='true')
        before=status()['scenes'][0]['frames'];page.wait_for_timeout(300)
        check('Offscreen hero stops repainting', status()['scenes'][0]['frames']==before)
        page.screenshot(path=str(out/'process.png'))
        page.locator('#portal').scroll_into_view_if_needed()
        page.locator('#asset-search').fill('NO-SUCH-ASSET')
        check('Portal search preserved', 'No demo assets' in page.locator('#asset-rows').inner_text())
        page.locator('#asset-search').fill('')
        page.locator('#portal-documents').click()
        check('Portal documents preserved', 'Document workspace' in page.locator('#portal-panel').inner_text())
        page.locator('a[href="#/legal/privacy"]').first.click()
        page.locator('#content-dialog').wait_for(state='visible')
        check('Privacy document remains accessible', page.locator('#content-dialog').evaluate('(d)=>d.open'))
        page.locator('#content-dialog [data-close]').click()
        page.locator('.privacy-shortcut').click()
        check('Cookie settings remain accessible', page.locator('#consent-dialog').evaluate('(d)=>d.open'))
        page.locator('#consent-reject').click()
        for width in [320,390,768,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':1000})
            page.wait_for_timeout(100)
            check(f'No horizontal overflow at {width}px', page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'))
        page.set_viewport_size({'width':1440,'height':1000});page.evaluate('scrollTo(0,0)');page.wait_for_timeout(4700)
        page.screenshot(path=str(out/'desktop.png'))
        page.evaluate('PTR_MOTION.pause()');page.screenshot(path=str(out/'full-page.png'),full_page=True)
        mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1,reduced_motion='reduce')
        phone=mobile.new_page();phone.on('pageerror', lambda e: errors.append(str(e)))
        load(phone);phone.wait_for_function('window.PTR_MOTION?.version === "4.0.0" && PTR_MOTION.status.logoPoints > 1000')
        if phone.locator('#reject-cookies').is_visible():phone.locator('#reject-cookies').click()
        phone.wait_for_timeout(150)
        check('Initial reduced-motion mobile load autoplays', phone.evaluate('PTR_MOTION.status.running'))
        before=digest(phone)
        phone.wait_for_timeout(400)
        check('Mobile canvas pixels animate without pressing play', digest(phone)!=before)
        # Exercise native touch events against the visible logo band, without blocking scrolling.
        visual=phone.locator('.hero-visual').bounding_box()
        height=visual['height']-35;size=min(visual['width']*.88,height*.88)
        x=visual['x']+visual['width']*.5-size*.1;y=visual['y']+height*.49-size*.40
        touch=mobile.new_cdp_session(phone)
        touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        phone.wait_for_timeout(350)
        check('Touch scatters logo pixels', phone.evaluate('PTR_MOTION.status.scenes[0].displacement > 10'))
        touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        phone.wait_for_timeout(2400)
        check('Touch release lets the logo reform', phone.evaluate('PTR_MOTION.status.scenes[0].displacement < 5'))
        check('Mobile touch affordance', 'Touch' in phone.locator('.motion-hint').inner_text())
        check('Mobile navigation retained', phone.locator('#mobile-menu-toggle').is_visible())
        phone.locator('.motion-control').tap();phone.wait_for_timeout(100)
        check('Mobile manual pause works', not phone.evaluate('PTR_MOTION.status.running'))
        load(phone);phone.wait_for_timeout(150)
        check('Reload always restores autoplay', phone.evaluate('PTR_MOTION.status.running') and phone.locator('.motion-control').inner_text() == 'Pause animation')
        phone.wait_for_timeout(4700);phone.screenshot(path=str(out/'mobile.png'))
        check('No runtime errors', not errors)
    finally:
        (out/'results.json').write_text(json.dumps({'source':args.url or 'isolated local HTML','version':VERSION,'checks':checks,'errors':errors},indent=2))
        print(json.dumps({'passed':sum(c['passed'] for c in checks),'total':len(checks),'errors':errors},indent=2),flush=True)
        browser.close()
