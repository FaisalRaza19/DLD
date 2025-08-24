const port = 6755
export const userAuth = {
    register: `http://localhost:${port}/user/register`,
    verify_register: `http://localhost:${port}/user/verify-register`,
    resendCode: `http://localhost:${port}/user/resend-code`,
    login: `http://localhost:${port}/user/login`,
    logOut: `http://localhost:${port}/user/logOut`,
    getUser: `http://localhost:${port}/user/get-user`,
    updateAvatar: `http://localhost:${port}/user/change-avatar`,
    verifyJWT: `http://localhost:${port}/user/verify-jwt`,
    editProfile: `http://localhost:${port}/user/edit-profile`,
    verify_edit: `http://localhost:${port}/user/verify-profile`,
    // forget pass
    email_pass: `http://localhost:${port}/user/email-pass`,
    update_pass: `http://localhost:${port}/user/change-pass`
}

export const cases = {
    createCase: `http://localhost:${port}/case/createCase`,
    editCase: `http://localhost:${port}/case/editCase`,// params id required
    delCase: `http://localhost:${port}/case/delCase`,
    changeStatus: `http://localhost:${port}/case/updateStatus`,
    getCases: `http://localhost:${port}/case/getCases`,
    getCase: `http://localhost:${port}/case/getCase`,
    restoreDocs: `http://localhost:${port}/case/restoreDocs`
}

export const Clients = {
    getClients: `http://localhost:${port}/subUser/getClient`,
    createClient: `http://localhost:${port}/subUser/createClient`,
    editClient: `http://localhost:${port}/subUser/editClient`,
    delClient: `http://localhost:${port}/subUser/delClient`,
}

export const Lawyers = {
    getLawyers: `http://localhost:${port}/subUser/getLawyer`,
    createLawyer: `http://localhost:${port}/subUser/createLawyer`,
    editLawyer: `http://localhost:${port}/subUser/editLawyer`,
    delLawyer: `http://localhost:${port}/subUser/delLawyer`
}


export const Hearings = {
    getHearings: `http://localhost:${port}/hearings/getCaseHearings`,
    addHearing: `http://localhost:${port}/hearings/createHearing`,
    editHearing: `http://localhost:${port}/hearings/editHearing`,
    delHearing: `http://localhost:${port}/hearings/deleteHearing`,
    // New notification endpoints
    getNotifications: `http://localhost:${port}/hearings/getNotifications`,
    markNotificationRead: `http://localhost:${port}/hearings/markNotificationRead`,
    deleteNotification: `http://localhost:${port}/hearings/deleteNotification`,
}