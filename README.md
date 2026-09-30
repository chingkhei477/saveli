# Saveli website

Static website for saveli.in. Plain HTML, CSS and JavaScript with no build step, plus one small PHP file for the contact form.

## Upload

Upload everything in this folder to the web root of saveli.in (for example `public_html` on Hostinger or any cPanel host). `index.html` is the home page.

To preview on your computer, unzip the folder and double-click `index.html`. Everything works offline except sending the contact form, which needs the live server (from your computer it opens your email app instead).

Turn on HTTPS (free SSL) in your hosting panel. Most hosts use `404.html` automatically. If yours does not, set it as the custom error page.

## Contact form

- On hosting with PHP (most shared hosting), the form sends messages to support@saveli.in through `contact.php`.
- Create the mailbox `no-reply@saveli.in` in your hosting panel, or change `SAVELI_FROM` at the top of `contact.php` to an address on your domain. Many hosts refuse mail from addresses that do not exist.
- If the server cannot send, or you host without PHP (Netlify, GitHub Pages, Vercel), the form opens the visitor's email app with the message filled in, addressed to support@saveli.in.
- Send one test message after uploading.

## Adding offers

Open `assets/js/offers.js` and add one entry for each store you are approved to promote, using your affiliate tracking link. The file has an example of the format at the top. The "Current offers" section and the category filter buttons appear automatically once the list has entries.

## Before launch, please check

1. **Legal review.** The policies are written for Indian law (DPDP Act 2023, IT Act 2000, Consumer Protection Act 2019). Have a lawyer review them before launch.
2. **Grievance Officer.** The Consumer Protection (E-Commerce) Rules 2020 and the IT Rules may require you to publish the Grievance Officer's name and designation. If your lawyer confirms they apply, add them to the Grievance section of `privacy-policy.html` and `terms.html`.
3. **Business facts assumed in the policies:**
   - Membership is free, and members need an account to earn cashback.
   - Members must be 18+ and live in India. Payouts go to UPI or an Indian bank account in the member's name.
   - Disputes are heard by courts with jurisdiction in Manipur.
   - Terms that mention a member account, login and payout requests describe your member area. Link to it from the header once it is live.
4. **Analytics.** The site sets no cookies. If you add Google Analytics, Meta Pixel or similar, update `cookie-policy.html` and add a consent banner.

## Files

| Path | Purpose |
| --- | --- |
| `*.html` | Pages: home, how it works, offers, about, contact, five policies, 404 |
| `assets/css/styles.css` | All styles, with light and dark themes |
| `assets/js/main.js` | Mobile menu, contact form, offers list |
| `assets/js/offers.js` | Your offers list |
| `assets/img/` | Logo (SVG), favicon, app icons, social sharing image |
| `contact.php` | Contact form handler |
| `sitemap.xml`, `robots.txt` | For search engines. Submit the sitemap in Google Search Console |
| `site.webmanifest`, `favicon.ico` | Browser and phone icons |

## Brand

- Saveli green `#0D5C4D`, marigold `#F2A516`, ink `#13241F`, background `#F6F8F5`
- Headings: Bricolage Grotesque. Body text: Figtree. Both load from Google Fonts.
- Logo files: `assets/img/logo-wordmark.svg`, `logo-wordmark-white.svg` (for dark backgrounds) and `logo-mark.svg` (app icon or profile picture).
