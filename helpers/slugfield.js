const slugify = require("slugify");

const options = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: true,
    locale: 'tr',
    trim: true
}

module.exports = function slugfield(str) {
    return slugify(str, options);
}