
class UserModel {
    constructor(profileJson) {
        if(profileJson){
            try {
                this.id = profileJson.id
                this.firstName = profileJson.profile.firstName
                this.secondName = profileJson.profile.lastName
                this.email = profileJson.profile.email
                this.organization = profileJson.profile.organization
                this.account_creator = profileJson.profile.account_creator
                this.status = profileJson.status

                this.lastLogin = profileJson.lastLogin
                this.lastUpdate = profileJson.lastUpdated
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

module.exports = UserModel