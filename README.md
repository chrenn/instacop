<p align="center"><img width="200" src="media/logo.png" alt="InstaCop"></p>

> Enhanced shopping experience for the adidas.com online store.

I decided to open source my adidas.com script. This has been in development since the day after I failed to get the 750 Grey/Gum manually, back in the days when you only had to generate a backdoor link with a captcha response.

Like the infamous Solemartyr script, InstaCop runs solely in the browser and is therefore limited in its scope.

Visit **[bequadro.github.io/instacop/](https://bequadro.github.io/instacop/)** for a live demo. HMAC and Captcha will not work there due to security limitations.

**This will not help you get through splash.**

# Features

- 5 Stock Checking Methods
- Auto Refresh, Auto ATC & Restock Monitor
- Captcha Harvesting
- 2Captcha & AntiCaptcha Support
- HMAC Cookie Management

<br>

![Screenshot](media/screenshot.png)



# Installation

Installation is similar to Solemartyr's script. Check YouTube if you have problems.

### 1. Download and unzip.

   [![Github All Releases](https://img.shields.io/github/downloads/bequadro/instacop/total.svg?style=flat-square)](https://github.com/bequadro/instacop/releases/latest)

### 2. Start a local server.

   ###### macOS

   Terminal: `sudo apachectl start`.

   ###### Windows

   Install MAMP or XAMPP.

### 3. Put the files into the server root folder.

   Place `index.html`, the `instacop` folder and both `icon` files in the server root or any subfolder.

   ###### macOS

   Go to `/Library/WebServer/Documents`.

   ###### Windows

   Look for some folder called `htdocs`, e.g. `C:\MAMP\htdocs`.

### 4. Open your host file.

   ###### macOS

   Terminal: `sudo nano /private/etc/hosts`.

   ###### Windows

   Edit `C:\Windows\System32\Drivers\etc\hosts` as admin.

### 5. Edit your host file.

   Add the following line, where `.tld` is your country's top level domain (`.com` for US, `.de` for Germany, ...).

   `127.0.0.1 w.www.adidas.tld`

### 6. Save your host file.

   ###### macOS

   Press `Ctrl+x` to exit, `y` to confirm, `Enter` to save.

   ###### Windows

   Just save the file.

### 7. Open InstaCop in your browser.

   Use the domain you specified in step 5. If you added the files to a subfolder in step 3, append its name to the URL.

# Usage

## Parameters

Get the necessary parameters during release (Sitekey, ClientID, Duplicate) from Twitter, Reddit or whatever.

You can retrieve the sitekey for the currently loaded PID with the `Get` button.

~~If you get through splash yourself, you can use the `AfterSplash` bookmarklet on the splash page. Just enter your local URL to transfer the values to InstaCop.~~

## Stock Checking

Avail. | Stock | ▲
--- | --- | ---
Pairs that are ready to be carted | Current stock including cart holds | Difference in stock between refreshs

The five stock checking methods are ranked by ther usefulness and combined when necessary. You can force fallback options by toggling the `Avail.` and `Stock` table headers.

~~**Client** is the primary method and the only one that can show avail. pairs. It checks the Demandware API with the provided ClientID key.~~ Unfortunately, adidas disabled that.

**API** uses the new adidas.com API. Generally pretty accurate, but only shows stock amount up to 15.

**HTML** scrapes the product page for stock numbers. Click `Avail.` to force HTML stock checking.

**Sizes** shows if a size is in stock or not. Usually accessible as soon as stock goes live.

**Variant** is the last fallback and uses an old endpoint. Numbers are way off.

## Auto Mode

`Auto` ATC Mode adds the size with the highest avail. number. Only works with *Client* stock checking.

`Monitor` alerts the stock number during each refresh with a browser notification. Works best with Auto Refresh.

Select the `Refresh` timeout and click again to change the number.

## Captchas

The default sitekey is a Google test key that always resolves without popup. Changing the sitekey with the `Edit` or `Get` button reloads InstaCop.

Import and export all your tokens by clicking on the `Token` badge.

You can toggle between [2Captcha](https://2captcha.com?from=3920048) and [AntiCaptcha](http://getcaptchasolution.com/bu8krdp7o3) by clicking on the header.

> Disclaimer: Referral links.

## HMAC

The HMAC cookie value cannot be changed without clicking the `Edit` button. This aims to prevent accidental changes.

Included in the download is a HMAC test page, which is accessible by navigating to `w.www.adidas.tld/hmac` and sets a fake cookie for 10 minutes. Do not use this during release!

## Config

Most of the editable values are saved locally. You can export them to another browser window by dragging the `ConfigLink` (located at the bottom under `Utils`).

# Support

I will provide absolutely no support regarding setup and usage.

Try Twitter or [r/adidasATC](https://reddit.com/r/adidasATC).

# Contributing

Feature-wise we are probably at the limit of what can be done with a client-side script. If you think of something, contact me or submit a pull request.

## About the code

Please excuse the messy code. This was my first JavaScript project.

I put everything in a single Vue.js component. `app.js` and `inventory.js` are coupled in a strange way. The CSS on top of bulma.css has way too many `!important`s in it.

I also did not use any build tools for this project, which is kind of insane, but makes forking easier for you.

Unfortunately, I don't have the time to refactor this project. If you'd like to contribute, please contact me or submit a pull request.

# License

☠️ Anyone on Sneaker Twitter trying to sell this in any shape or form can rot in hell.

# Contact

- [bequadro](https://twitter.com/b_q_____)
- [InstaCop](https://twitter.com/InstaCopV2)