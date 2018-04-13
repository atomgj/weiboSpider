var cookieService;

cookieService = {
    cookie: '',
    setCookie: function (cookie) {
        this.cookie = cookie;
        return this;
    },
    getCookie: function () {
        return this.cookie;
    }
};

module.exports = cookieService;
