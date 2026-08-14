import { type NextFunction, type Request, type Response } from "express";
import { type TokenGenerator} from "../../../domain/services/token-generator";
import { JwtTokenGenerator } from "../../services/jwt-token-generator";
import { BusinessError } from "../../../domain/errors/business-error";

export function extractBearerToken(authorizationHeader?: string) : string {

    if(!authorizationHeader){
        throw new BusinessError("Token não informado", 401)
    }

    const [schema, token] = authorizationHeader.split(' ')

    if( schema !== 'Bearer' || !token ){
        throw new BusinessError("Token mal formatado",401)
    }

    return token

}

export function authMiddleware(tokenGenerator : TokenGenerator = new JwtTokenGenerator()){
    return(request : Request, _response : Response, next : NextFunction): void => {
        try {
            const token = request.cookies?.token ?? extractBearerToken(request.headers.authorization)
            const payload = tokenGenerator.verify(token)

            if(!payload?.userId){
                throw new BusinessError("Token inválido", 401)
            }

            request.user = {
                userId: payload.userId
            }
            next()
        }
        catch (error) {
            next(error)
        }
    }
}

