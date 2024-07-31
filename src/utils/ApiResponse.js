class ApiResponse{
    constructor(statusCode, data, massage = "Sucess"){
        this.statusCode = statusCode
        this.data = data
        this.massage = massage
        this.success = statusCode < 400
    }
}

export { ApiResponse };