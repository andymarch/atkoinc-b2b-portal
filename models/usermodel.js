
class UserModel {
    constructor(profileJson) {
        if(profileJson){
            try {
                this.id = profileJson.id
                this.firstName = profileJson.profile.firstName
                this.secondName = profileJson.profile.lastName
                this.email = profileJson.profile.email
                this.organization = profileJson.profile.organization
                this.status = profileJson.status

                this.account_creator = profileJson.profile.account_creator
                this.account_owner = profileJson.profile.account_owner
                this.validated = profileJson.profile.account_validated
                this.authenticated = profileJson.profile.account_authenticated
                this.federated = profileJson.profile.account_federated

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