import {validationResult} from "express-validator"

export function validator(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let error = "The parameters are not formatted properly\n\n"
        errors.array().forEach((e) => {
            error += "- Parameter: **" + e.param + "** - Reason: *" + e.msg + "* - Location: *" + e.location + "*\n\n"
        })
        return res.status(422).json({error: error})
    }
    return next()
}