import { validationResult } from 'express-validator'

// ve si hay error de validacion o no, se utiliza despues de validar los validation
const handleValidation = async (req, res, next) => {
  const err = validationResult(req)
  if (err.errors.length > 0) {
    res.status(422).send(err)
  } else {
    next()
  }
}

export { handleValidation }
