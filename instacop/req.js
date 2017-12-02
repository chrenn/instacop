$.ajax({
  type: "POST",
  url: "https://www.adidas.de/api/cart_items",
  data: JSON.stringify({
    product_id: "BY9696",
    quantity: 1,
    product_variation_sku: "BY9696_530",
    size: "36",
    recipe: null,
    invalidFields: [],
    isValidating: false,
    clientCaptchaResponse: ""
  }),
  contentType: "application/json",
  dataType: "json"
})
  .then(data => console.log(data))
  .fail((xhr, status, error) => console.log(xhr, status, error));
