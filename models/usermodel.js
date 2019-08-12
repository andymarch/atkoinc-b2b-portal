
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

                this.validated = (profileJson.profile.account_validated === 'true')
                this.authenticated = (profileJson.profile.account_authenticated === 'true')
                this.federated = (profileJson.profile.account_federated === 'true')

                this.lastLogin = profileJson.lastLogin
                this.lastUpdate = profileJson.lastUpdated
            }
            catch(error) {
                console.log(error);
            }
        }
    }

    setAccountCreator(linkedObjectJson) {
        this.account_creator = new UserModel(linkedObjectJson)
    }

    setAccountOwner(linkedObjectJson){
        this.account_owner = new UserModel(linkedObjectJson)
    }
}

module.exports = UserModel