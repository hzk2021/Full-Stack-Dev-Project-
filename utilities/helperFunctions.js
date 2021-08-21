/* Check if value is a number */
function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

/* Get object key by its value */
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

module.exports = {isNumeric, getKeyByValue};