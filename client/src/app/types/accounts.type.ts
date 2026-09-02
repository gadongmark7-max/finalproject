

export interface accountInterfaceInput {
    name: string,
    type: string,
    contact: string,
    email: string,
    subscriptionExpiration : string | null,
    password: string,
    profile  :string,
    isBan : boolean,
    pin : string | null,
    location?: {
        lat?: number | null
        long?: number | null
    } | null

}

export interface accountInterface extends accountInterfaceInput {
    _id : string,
}


export interface artistInfoInterfaceInput {
    artist : string,
    bio : string,
    schedTime : string[],
    schedDay : string[],
    profileImages : {
        type : string,
        fileUrl : string,
        fileType : string,
    }[], 
    reviews : {
        client : string,
        comment : string,
        img : string,
        rating :number,
    }[], 
}

export interface artistInfoInterface {
    _id : string,
    artist : accountInterface,
    bio : string,
    schedTime : string[],
    schedDay : string[],
    profileImages : {
        type : string,
        fileUrl : string,
        fileType : string,
    }[], 
    reviews : {
        client : accountInterface,
        comment : string,
        img : string,
        rating :number,
    }[], 
}


export interface configInterface {
    artistPayment : boolean,
    financeApproval : boolean,
    overTimePayment : boolean,
    artistToOtherBussiness : boolean,
    artistPost : boolean,
    artistBookAppointment : boolean,
}


export interface employeeInfo {
    fullname : string,
    email : string,
    contact : string,
    dateOfBirth : string,
    Gender : string,
    civilStatus : string,
    address : string,
    TIN : string,
    SSS : string,
    PhilHealth : string,
    PagIbig : string,
}


export interface bussinessInfoInterfaceInput {
    bio : string,
    bussiness : string,
    config : configInterface,
    isLookingArtist : boolean,
    jobDescription : string,
    artists : {
        artist : accountInterface,
        schedTime : string[],
        schedDay : string[],
        commision : number,
        salary : number,
        salaryType : string,
        info : employeeInfo
    }[],
    employees : {
        employee : accountInterface,
        employeeInfo : string,
        info : employeeInfo
    }[],
    roles : {
        role : string,
        permissions : string[]
    }[],
    profileImages : {
        type : string,
        fileUrl : string,
        fileType : string
    }[],
    reviews : {
        client : string,
        comment : string,
        img : string,
        rating :number,
    }[], 
}

export interface bussinessInfoInterface {
    _id : string,
    bio : string,
    bussiness : accountInterface,
    isLookingArtist : boolean,
    jobDescription : string,
    config : configInterface,
    artists : {
        artist : accountInterface,
        schedTime : string[],
        schedDay : string[],
        commision : number,
        salary : number,
        salaryType : string,
        info : employeeInfo
    }[],
    employees : {
        employee : accountInterface,
        employeeInfo : employeeInterface,
        info : employeeInfo
    }[],
    roles : {
        role : string,
        permissions : string[]
    }[],
    profileImages : {
        type : string,
        fileUrl : string,
        fileType : string
    }[],
    reviews : {
        client : accountInterface,
        comment : string,
        img : string,
        rating :number,
    }[], 
}



    
export interface artistVerificationInterfaceInput {
    client : string,
    validId : string,
    bussinessPermit : string | null,
    type : string,
    permitExpiration : string,
    bussinessName : string,
    barangayClearance : string,
    clearanceExpiration : String,
}

export interface artistVerificationInterface {
    _id : string,
    client : accountInterface,
    validId : string,
    bussinessPermit : string | null,
    type : string,
    permitExpiration : string,
    bussinessName : string,
     barangayClearance : string,
     clearanceExpiration : string,
}

export interface artistApplicationInterfaceInput {
    artist : string,
    bussiness : string,
    date :  string,
    time : string
}

export interface artistApplicationInterface {
    _id : string,
    artist : accountInterface,
    bussiness : accountInterface,
    date :  string,
    time : string
}



export interface employeeInterfaceInput {
    account : string,
    email : string,
    bussiness : string,
    role : string,
    permissions : string[],
    salary : number,
    salaryType : string,
    schedTime : string[],
    schedDay : string[],
}



export interface employeeInterface {
    _id : string,
    account : accountInterface,
    email : string,
    role : string,
    bussiness : accountInterface,
    permissions : string[],
    salary : number,
    salaryType : string,
    schedTime : string[],
    schedDay : string[],
}
