
class ApplicationModel {
    constructor(applink) {
        this.title = applink.label
        this.link = applink.linkUrl
        this.logoUrl = applink.logoUrl
    }
}

module.exports = ApplicationModel