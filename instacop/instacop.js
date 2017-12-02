// InstaCop V2 (c) 2017 twitter.com/InstaCopV2 twitter.com/bqdxo //

// ------- BACKDOOR --------------------------------------------------------------------------------------------------- //

function addToCart(pidSize) {

	var pidStyle = $('#pid_style').val();
	var captchaToken = getToken();
	var xprVal = $('#xpr_val').val();
	var clientID = $('#client_id').val();

	//$('#post_xpr').prop('disabled', !($('#xpr_check').is(':checked')));

	var actionLink = 'https://www.adidas.' + locDomain + '/on/demandware.store/Sites-adidas-' + locCountry + '-Site/' + locLang + '/Cart-MiniAddProduct';
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

	if ($('#serialize_check').is(':checked')) {
		$('#post_form_serialized').submit();
	} else {
		$('#post_form').submit();
	}

}

function generateSplash() {

	var siteKey = $('#site_key').val();
	var pidStyle = $('#pid_style').val();
	var pidSize = $('#pid_size').val();
	//var xprVal = $('#xpr_check').is(':checked') ? $('#xpr_val').val() : '';
	var xprVal = $('#xpr_val').val();

	var data = siteKey + '&' + locDomain + '&' + locCountry + '&' + locLang + '&' + pidStyle + '&' + pidSize + '&' + xprVal;

	$('#splash_txt').val(data);
	$('#splash_txt').select();

}

function openSplash() {

	window.open('http://www.adidas.com/' + locCountry.toLowerCase() + '/apps/yeezy', '_blank');
	window.open('http://www.adidas.' + locDomain + '/yeezy', '_blank');

}


// ------- CART ------------------------------------------------------------------------------------------------------- //

function goToADC(value) {

	var adcLink = 'https://www.adidas.' + locDomain + '/on/demandware.store/Sites-adidas-' + locCountry + '-Site/' + locLang;

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

function setTimer() {

	Cookies.set('clientReservationTimeStart', Date.now(), {
		path: '',
		domain: 'adidas.' + locDomain
	});

}


// ------- STOCK ------------------------------------------------------------------------------------------------------ //

function loadStock() {

	var pidStyle = $('#pid_style').val();
	var clientID = $('#client_id').val();
	var clientStore = '-store-';
	var stockRefresh = $('#stock_status');

	$('#stock_gif').addClass('gly-spin');
	$('#stock_status').html("...");

	clientCache = clientStock;
	clientStock = [];

	switch (locCountry) {case 'US': case 'CA': case 'MX': clientStore = '-us-'};

	var clientMasterURL = 'http://production' + clientStore + 'adidasgroup.demandware.net/s/adidas-' + locCountry + '/dw/shop/v15_6/products/' + pidStyle + '?client_id=' + clientID + '&expand=variations,availability&callback=?';

	function clientSizeURL(size) {
		return 'http://production' + clientStore + 'adidasgroup.demandware.net/s/adidas-' + locCountry + '/dw/shop/v15_6/products/' + pidStyle + '_' + size + '?client_id=' + clientID + '&expand=availability&callback=?';
	}

	$.getJSON(clientMasterURL, function(data1) {

		$.each(data1.variation_attributes[0].values, function(index, data2) {

			clientStock.push( {
				szc : data2.value,
				size : data2.name,
				stock : index,
				change : index
			});

			$.getJSON(clientSizeURL(data2.value), function(data3) {

				clientStock[index].stock = data3.inventory.ats;

				try {

					var diff = data3.inventory.ats - clientCache[index].stock;
					diff = (diff>0 ? '+' : '') + diff;
					clientStock[index].change = diff;

				} catch(err) {

					clientStock[index].change = '0';

				}

			})

				.done(function() {

					buildStock(clientStock);

				});

		});

		$('#table_location').html(locCountry);
		$('#table_total').html(data1.inventory.ats);
		$('#stock_gif').removeClass('gly-spin');
		$('#stock_status').html("Client ID");

	})

		.fail(function() {

			$('#stock_status').html("...");

			var variantURL = 'https://www.adidas.' + locDomain + '/on/demandware.store/Sites-adidas-' + locCountry + '-Site/' + locLang + '/Product-GetVariants?pid=' + pidStyle;

			var variantTotal = 0;

			$.getJSON('instacop/proxy.php?csurl=' + variantURL, function(data4) {

				$.each(data4.variations.variants, function(index, data5) {

					clientStock.push( {
						szc : data5.id.split('_')[1],
						size : data5.attributes.size,
						stock : data5.ATS,
						change: index
					});

					variantTotal += data5.ATS;

					try {

						var diff = data5.ATS - clientCache[index].stock;
						diff = (diff>0 ? '+' : '') + diff;
						clientStock[index].change = diff;

					} catch(err) {

						clientStock[index].change = '0';

					}

				});

			})

				.done(function() {

					$('#table_location').html(locCountry);
					$('#table_total').html(variantTotal);
					$('#stock_gif').removeClass('gly-spin');
					$('#stock_status').html("GetVariant");

					buildStock(clientStock);

				})

				.fail(function() {

					$('#table_location').html(sizeChartLocale);
					$('#table_total').html('');
					$('#stock_gif').removeClass('gly-spin');
					$('#stock_status').html("¯\\_(ツ)_/¯");

					buildStock(sizeChart);

				});

		});

}

function buildStock(stock) {

	var transform = {"tag":"table", "children":[
		{"tag":"tbody","children":[
			{"tag":"tr","children":[
				{"tag":"td","class":"table-size","html":"${szc}"},
				{"tag":"td","html":"${size}"},
				{"tag":"td","class":"table-stock text-right","html":"${stock}"},
				{"tag":"td","class":"table-change text-right","html":"${change}"},
				{"tag":"td","children":[
					{"tag":"a","class":"label table-add pull-right","id":"${szc}","align":"center","html":"Add"}
				]}
			]}
		]}
	]};

	$('#stock_table').html(json2html.transform(stock,transform));

	$('.table-add').click(function() {
		addToCart(this.id);
	});

	$('.table-stock').each(function() {
		if($(this).html() != '0' && $(this).html() != '?') {
			$(this).addClass('solar-fg');
		};
	});

	$('.table-change').each(function() {
		if($(this).html().substring(0, 1) == '+') {
			$(this).parent().addClass('tr-highlight');
		};
	});

}

function loadPidImg() {

	if ($('#pid_style').val().length == 6) {

		$('#pid_img').html('');

		var pidImgLink = 'https://sits-pod14-adidas.demandware.net/dw/image/v2/aagl_prd/on/demandware.static/Sites-adidas-DE-Site/Sites-adidas-products/de_DE/v1475835299209/zoom/' + $('#pid_style').val() + '_01_standard.jpg?sw=200&sh=200&sm=fit';

		$('#pid_img').css('background-image', 'url(' + pidImgLink + ')');

	} else {

		$('#pid_img').css('background-image', '');
		$('#pid_img').html('-');

	}

}


// ------- TOKENS ----------------------------------------------------------------------------------------------------- //

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