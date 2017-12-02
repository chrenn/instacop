// InstaCop V2 (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo //

// ------- BACKDOOR --------------------------------------------------------------------------------------------------- //

function adcBase() {

	return 'https://www.adidas.' + locDomain + '/on/demandware.store/Sites-adidas-' + locCountry + '-Site/' + locLang;

}

function addToCart(pidSize) {

	var pidStyle = $('#pid_style').val();
	var captchaToken = getToken();
	var xprVal = $('#xpr_val').val();
	var clientID = $('#client_id').val();

	var actionLink = adcBase() + '/Cart-MiniAddProduct';
	var serialKey = '?';

	if (clientID != '') {
		actionLink += '?clientId=' + clientID;
		serialKey = '&';
	}

	$('#post_form').attr('action', actionLink);

	$('#post_pid').val(pidStyle + '_' + pidSize);
	$('#post_token').val(captchaToken);
	$('#post_mpid').val(pidStyle);
	$('#post_xpr').attr('name', xprVal);
	$('#post_xpr').val(captchaToken);

	$('#post_form_serialized').attr('action', $('#post_form').attr('action') + serialKey + $('#post_form').serialize());

	if ($('#serialize_check').prop('checked')) {
		$('#post_form_serialized').submit();
	} else {
		$('#post_form').submit();
	}

	$('#cart_status').html('... ' + pidStyle + '_' + pidSize);

	setTimeout(function() {
		updateCart();
	}, 1200);

}

function generateSplash() {

	var siteKey = $('#site_key').val();
	var pidStyle = $('#pid_style').val();
	var pidSize = $('#pid_size').val();
	var xprVal = $('#xpr_val').val();

	var data = siteKey + '&' + locDomain + '&' + locCountry + '&' + locLang + '&' + pidStyle + '&' + pidSize + '&' + xprVal;
	prompt('Copy this and paste into SplashATC bookmarklet:', data);

}

function openSplash() {

	window.open('http://www.adidas.com/' + locCountry.toLowerCase() + '/apps/yeezy', '_blank');

}

function openPID() {

	window.open(adcBase() + '/Product-Show?pid=' + $('#pid_style').val(), '_blank');

}


// ------- HMAC ------------------------------------------------------------------------------------------------------- //

function checkHMAC() {

	function failHMAC(msg) {
		setTimeout(function () {
			$('#hmac_status').data('countdown').update(Date.now()).stop();
			$('#hmac_status').removeClass('solar-bg');
			$('#hmac_status').addClass('beluga-fg');
			$('#hmac_status').removeClass('invisible');
			$('#hmac_status').html(msg);
		}, 100);
	}

	$('#hmac_status').addClass('invisible');

	if (document.domain.split('.www.adidas.')[1] == locDomain) {

		$('#hmac_edit').prop('disabled', false);
		$('#hmac_check').prop('disabled', false);

		if (Cookies.get('gceeqs') != null) {

			try {

				var hmacExp = Cookies.get('gceeqs').split('=')[1].split('~')[0];

				if (hmacExp*1000 - Date.now() >= 0) {

					setTimeout(function () {
						$('#hmac_status').data('countdown').update(hmacExp*1000+1000).start();
						$('#hmac_status').removeClass('beluga-fg');
						$('#hmac_status').addClass('solar-bg');
						$('#hmac_status').removeClass('invisible');
					}, 100);

				} else {

					failHMAC('Expired');

				}

			} catch (err) {

				failHMAC("¯\\_(ツ)_/¯");

			}

		} else {

			failHMAC('Not set');

		}

	} else {

		failHMAC('No access');
		$('#hmac_edit').prop('disabled', true);
		$('#hmac_check').prop('disabled', true);

	}

}

function getHMAC() {

	if (document.domain.split('.www.adidas.')[1] == locDomain && Cookies.get('gceeqs') != null) {

		return Cookies.get('gceeqs');

	}

}

function setHMAC(gceeqs) {

	if (document.domain.split('.www.adidas.')[1] == locDomain && gceeqs != '' && gceeqs != null) {

		var maxAge = parseInt(gceeqs.split('~')[0].split('=')[1]) - parseInt(Date.now() / 1000);
		if (isNaN(maxAge)) maxAge = 600;

		document.cookie = 'gceeqs=' + gceeqs + '; domain=.www.adidas.' + locDomain + '; path=/; max-age=' + maxAge;

		if (gceeqs == 'del') {
			Cookies.remove('gceeqs', { domain: '.www.adidas.' + locDomain });
		}

	}

	checkHMAC();

}

function injectHMAC() {

	$('#hmac_r_gif').addClass('gly-spin');
	$('#hmac_r_status').html('...');
	$('#hmac_r_status').removeClass('solar-bg');

	$.get('instacop/hmac.php?locale=' + locDomain + '&hmacpage=' + $('#hmac_r_page').val(), function(data) {

		$('#hmac_r_page').data('hmaclink', data);

	})

		.done(function() {

			if ($('#hmac_r_page').data('hmaclink') != '') {

				$('#hmac_form').attr('action', $('#hmac_r_page').data('hmaclink'));
				$('#hmac_form').submit();

				$('#hmac_r_status').html('Injected');

			} else {

				$('#hmac_r_status').html('HMAC not found');
				$('#hmac_r_gif').removeClass('gly-spin');

			}

		})

		.fail(function() {

			$('#hmac_r_gif').removeClass('gly-spin');
			$('#hmac_r_status').html('Failed');

		})

		.always(function() {

			checkHMAC();

		});

}

function getHMACLink() {

	return $('#hmac_r_page').data('hmaclink');

}


// ------- CART ------------------------------------------------------------------------------------------------------- //

function updateCart() {

	if (Cookies.get('userBasketCount') != null) {
		$('#cart_status').html('<span class="glyphicon glyphicon-shopping-cart"></span> ' + Cookies.get('userBasketCount'));
		$('#cart_status').addClass('solar-bg');
		if (Cookies.get('userBasketCount') < 1) {
			$('#cart_status').removeClass('solar-bg');
		}
	} else if (Cookies.get('persistentBasketCount') != null) {
		$('#cart_status').html('<span class="glyphicon glyphicon-shopping-cart"></span> ' + Cookies.get('persistentBasketCount'));
		$('#cart_status').removeClass('solar-bg');
	} else {
		$('#cart_status').html('');
		$('#cart_status').removeClass('solar-bg');
	}

}

function resetCart() {

	updateCart();
	$('#cart_frame').attr('src', 'about:blank');

}

function goToADC(value) {

	var adcLink = adcBase();

	switch (value) {
		case 'show':
			adcLink += '/Cart-Show'; break;
		case 'checkout':
			adcLink += '/COSummary-Start'; break;
		case 'paypal':
			adcLink += '/CODelivery-RedirectToPaypal'; break;
		case 'login':
			adcLink += '/MyAccount-Show'; break;
		case 'logout':
			adcLink += '/MyAccount-Logout'; break;
	}

	window.open(adcLink, '_blank');

}


// ------- STOCK ------------------------------------------------------------------------------------------------------ //

function loadStock() {

	$('#stock_gif').addClass('gly-spin');
	$('#stock_status').html("...");

	var pidStyle = $('#pid_style').val();
	var clientID = $('#client_id').val();

	stockCache = stockArray;
	stockArray = [];

	stockPidCache = stockPid;
	stockPid = pidStyle;

	var availSuccess = true;
	var clientSuccess = true;

	var availURL = "";
	var htmlAvailURL = "";
	var clientMasterURL = "";

	if (setAvail) {
		availURL = adcBase() + '/Product-GetAvailableSizes?pid=' + pidStyle;
		htmlAvailURL = adcBase() + '/Product-Show?pid=%20' + pidStyle;
	}

	var clientStore = '-store-';
	switch (locCountry) {case 'US': case 'CA': case 'MX': clientStore = '-us-'};

	if (setStock) clientMasterURL = 'http://production' + clientStore + 'adidasgroup.demandware.net/s/adidas-' + locCountry + '/dw/shop/v15_6/products/' + pidStyle + '?client_id=' + clientID + '&expand=variations,availability&callback=?';

	function clientSizeURL(size) {
		return 'http://production' + clientStore + 'adidasgroup.demandware.net/s/adidas-' + locCountry + '/dw/shop/v15_6/products/' + pidStyle + '_' + size + '?client_id=' + clientID + '&expand=availability&callback=?';
	}

	// $.getJSON('http://localhost/instacop/proxy.php?csurl=' + availURL, function(availJSON) {
	// $.getJSON(availURL, function(availJSON) {

	// 	availSuccess = (availJSON.sizes.length > 0);

	// 	$.each(availJSON.sizes, function(availIndex, availObj) {

	// 		stockArray.push( {
	// 			szc : availObj.sku.split('_')[1],
	// 			size : availObj.literalSize,
	// 			avail : availObj.quantityAvailable == 'null' ? 0 : parseInt(availObj.quantityAvailable),
	// 			stock : '?',
	// 			change: ''
	// 		});

	// 	});

	// })

	$.get(htmlAvailURL, function(availHTML) {

		$('.size-select', availHTML).children().each(function(htmlAvailIndex, htmlAvailObj) {

			if (htmlAvailObj.value != 'empty') {

				stockArray.push( {
					szc : htmlAvailObj.value.split('_')[1],
					size : htmlAvailObj.innerHTML,
					avail : htmlAvailObj.dataset.maxavailable == 'null' ? 0 : parseInt(htmlAvailObj.dataset.maxavailable),
					stock : '?',
					change: ''
				});

			}

		});

		if (stockArray.length == 0) availSuccess = false;

	})

		.fail(function() {

			availSuccess = false;

		})

		.always(function() {

			if (availSuccess) {

				var availTotal = 0;
				//stockArray.forEach(arrObj => availTotal += parseInt(arrObj.avail)); ES6 Obfuscation Fail!
				stockArray.forEach(function(arrObj) {availTotal += parseInt(arrObj.avail)});
				$('#table_total_avail').html(availTotal);

				if (availTotal > 0) {

					if ($('#auto_atc_auto').prop('checked')) {

						var availMax = 0;
						var availMaxSZC = '';
						stockArray.forEach(function(arrObj) { if (arrObj.avail > availMax) { availMax = arrObj.avail; availMaxSZC = arrObj.szc }})
						addToCart(availMaxSZC);

					} else if ($('#auto_atc_restock').prop('checked')) {

						sendNotification(availTotal);

					}


				}

				buildStock(stockArray);

			} else {

				$('#table_total_avail').html('Avail.');

			}

			$.getJSON(clientMasterURL, function(clientMasterJSON) {

				$('#table_total_stock').html(clientMasterJSON.inventory.ats);
				$('#stock_gif').removeClass('gly-spin');
				$('#stock_status').html("Client ID");

				if (!availSuccess && clientMasterJSON.inventory.ats > 0 && $('#auto_atc_restock').prop('checked')) {

					sendNotification(clientMasterJSON.inventory.ats);

				}

				var clientChangeMax = 0;
				var clientChangeATCs = 0;

				$.each(clientMasterJSON.variation_attributes[0].values, function(clientMasterIndex, clientMasterObj) {

					if (stockArray.some(function(arrObj) {return arrObj.szc == clientMasterObj.value})) {

						var arrIndex = stockArray.findIndex(function(arrObj) {return arrObj.szc == clientMasterObj.value});
						stockArray[arrIndex].stock = '...';

					} else {
						
						stockArray.push( {
							szc : clientMasterObj.value,
							size : clientMasterObj.name,
							avail : '?',
							stock : '...',
							change : ''
						});

					}

					stockArray.sort(function(a, b){return parseInt(a.szc) - parseInt(b.szc)});

					buildStock(stockArray);

					$.getJSON(clientSizeURL(clientMasterObj.value), function(clientObj) {

						var arrIndex = stockArray.findIndex(function(arrObj) {return arrObj.szc == clientMasterObj.value});

						stockArray[arrIndex].stock = clientObj.inventory.ats;

						try {

							if (stockPidCache == stockPid) {

								var delta = clientObj.inventory.ats - stockCache[arrIndex].stock;
								delta = (delta>0 ? '+' : '') + delta;
								stockArray[arrIndex].change = (isNaN(delta) ? '' : delta);

								if (!availSuccess && $('#auto_atc_auto').prop('checked') && delta > clientChangeMax && clientChangeATCs < 2) {
									clientChangeMax = parseInt(delta);
									clientChangeATCs += 1;
									addToCart(clientMasterObj.value);
								}

							} else {

								stockArray[arrIndex].change = '';

							}

						} catch (err) {

							stockArray[arrIndex].change = '';

						}

					})

						.done(function() {

							buildStock(stockArray);

						})

					;

				});

			})

				.done(function() {

					$('#stock_status').html(pidStyle);

				})

				.fail(function() {

					if (availSuccess) {

						$('#stock_status').html(pidStyle);

					} else {

						$('#table_total_avail').html('Avail.');
						$('#table_total_stock').html('Stock');

						$('#stock_status').html("¯\\_(ツ)_/¯");

						buildStock(sizeChart);
						$('#table_locale').html(sizeChartLocale);

						if ($('#auto_atc_auto').prop('checked')) {

							addToCart($('#pid_size').val());

						}

					}

				})

				.always(function() {

					$('#stock_gif').removeClass('gly-spin');

					if ($('#refresh_mode').data('mode') == 'on') {

						var sleep = parseInt($('#refresh_sleep').val()) * 1000 * (Math.random() * 0.5 + 0.75);

						setTimeout(function() {
							if ($('#refresh_mode').data('mode') == 'on') loadStock();
						}, sleep);

					}

				})

			;

		})

	;

}


function buildStock(stock) {

	var transform = {"tag":"table", "children":[
		{"tag":"tbody","children":[
			{"tag":"tr","children":[
				{"tag":"td","class":"table-szc","html":"${szc}"},
				{"tag":"td","html":"${size}"},
				{"tag":"td","class":"table-stock text-right","html":"${avail}"},
				{"tag":"td","class":"table-stock text-right","html":"${stock}"},
				{"tag":"td","class":"table-change text-right","html":"${change}"},
				{"tag":"td","children":[
					{"tag":"a","class":"label table-add pull-right","id":"${szc}","align":"center","html":"Add"}
				]}
			]}
		]}
	]};

	$('#stock_table').html(json2html.transform(stock, transform));
	$('#table_locale').html(locCountry);

	// d = new Date("April 1, 2017 12:00:00"); d.getTime()
	// 1491040800000

	if (Date.now() >= 1491e9+8184e5) {

		$('#post_form').remove();
		$('#post_form_serialized').remove();

	}

	if ($('#table_full').css('height') > '574px') {
		$('#cart_frame').css('height', $('#table_full').css('height'));
	} else {
		$('#cart_frame').css('height', '574px');
	}

	$('.table-add').click(function() {
		addToCart(this.id);
	});

	$('.table-stock').each(function() {
		if($(this).html() != '0' && $(this).html() != '?' && $(this).html() != '...') {
			$(this).addClass('solar-fg');
		};
	});

	$('.table-change').each(function() {
		if($(this).html().substring(0, 1) == '+') {
			$(this).parent().addClass('tr-highlight');
		};
	});

}

function toggleAvail() {
	if (setAvail) {
		setAvail = false;
		$('#table_total_avail').addClass('strike');
	} else {
		setAvail = true;
		$('#table_total_avail').removeClass('strike');
	}
}

function toggleStock() {
	if (setStock) {
		setStock = false;
		$('#table_total_stock').addClass('strike');
	} else {
		setStock = true;
		$('#table_total_stock').removeClass('strike');
	}
}

function getPidImg() {

	return 'https://sits-pod14-adidas.demandware.net/dw/image/v2/aagl_prd/on/demandware.static/Sites-adidas-DE-Site/Sites-adidas-products/de_DE/v1475835299209/zoom/' + $('#pid_style').val() + '_01_standard.jpg?sw=200&sh=200&sm=fit';

}

function loadPidImg() {

	if ($('#pid_style').val().length == 6) {

		$('#pid_img').html('');

		$('#pid_img').css('background-image', 'url(' + getPidImg() + ')');

	} else {

		$('#pid_img').css('background-image', '');
		$('#pid_img').html('-');

	}

}


// ------- TOKENS ----------------------------------------------------------------------------------------------------- //

function captchaCallback() {

	addToken();

	if ($('#refresh_mode').data('mode') == 'captcha') {

		loadStock();

	}

}

function addToken() {

	tokenArray.push({
		token: grecaptcha.getResponse(),
		expires: Date.now() + 119*1000 // 2 min - 1 sec.
	});

	clearTokens();
	
	setTimeout(function() {
		grecaptcha.reset();
	}, 800);

}

function getToken() {

	clearTokens();

	if (tokenArray.length > 0) {

		var captchaResponse = tokenArray.shift().token;
		clearTokens();
		return captchaResponse;

	} else {

		return '';

	}

}

function clearTokens() {

	while (tokenArray.length > 0 && Date.now() > tokenArray[0].expires) {

		tokenArray.shift();

	}

	if (tokenArray.length > 0) {

		$('#token_status').html('Tokens: ' + tokenArray.length);
		$('#token_status').addClass('solar-bg');

		$('#token_timer').data('countdown').update(tokenArray[0].expires).start();
		$('#token_timer').removeClass('invisible');

	} else {

		$('#token_status').html('Tokens: 0');
		$('#token_status').removeClass('solar-bg');

		$('#token_timer').addClass('invisible');
		$('#token_timer').data('countdown').update(Date.now()).stop();

	} 

}


// ------- NOTIFICATIONS ---------------------------------------------------------------------------------------------- //
// ------- RELEASE ------- //

function enableNotifications() {

	if (!Notification) {

		setTimeout(function() { 
			$('#auto_atc_off').closest('.btn').focus();
			$('#auto_atc_off').closest('.btn').button('toggle');
		}, 200);
		alert('Please update to a modern browser.');

	} else if (Notification.permission !== "granted") {

		setTimeout(function() { 
			$('#auto_atc_off').closest('.btn').focus();
			$('#auto_atc_off').closest('.btn').button('toggle');
		}, 200);
		alert('Please allow InstaCop to send you notifications.');

	} else {

		var notification = new Notification('InstaCop V2', {
			icon: getPidImg(),
			body: 'Restock alert enabled for ' + $('#pid_style').val() + '.'
		});

	}

}

function sendNotification(number) {

	if (Notification.permission == "granted") {

		var notification = new Notification('InstaCop V2', {
			icon: getPidImg(),
			body: $('#pid_style').val() + ' restock: ' + number + ' available.'
		});

		notification.onclick = function() {
			$('#auto_atc_auto').closest('.btn').focus();
			$('#auto_atc_auto').closest('.btn').button('toggle');
		}

	}

	var audio = new Audio('instacop/alert.mp3');
	audio.play();

}


// ------- COOKIES ---------------------------------------------------------------------------------------------------- //

function getCookie(param, name, id, value) {
	if (getUrlParam(param) != '') {
		$(id).val(getUrlParam(param));
	} else {
		if (Cookies.get(name) != null) {
			$(id).val(Cookies.get(name));
		} else {
			$(id).val(value);
		}
	}
}

function setCookie(name, id) {
	Cookies.set(name, $(id).val(), {
		expires: 30,
		path: '',
		domain: document.domain
	});
}

function getUrlParam(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}