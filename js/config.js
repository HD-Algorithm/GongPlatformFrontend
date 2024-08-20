CONFIG = (function() {
    return {
        isDevelopment: true,

        get API_BASE_URL() {
            return this.isDevelopment
                ? 'http://127.0.0.1:8080/'
                : 'https://wollongong.site/';
        },
    };
})();