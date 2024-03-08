import * as ProductValidation from '../controllers/validation/ProductValidation.js'
import ProductController from '../controllers/ProductController.js'
import { Product } from '../models/models.js'
import { handleFilesUpload } from '../middlewares/FileHandlerMiddleware.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as ProductMiddleware from '../middlewares/ProductMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = (app) => {
  app.route('/products')
    .post(
      isLoggedIn, // mira si el usuario esta logueado o no, si no lo está manda un error
      hasRole('owner'), // mira si el usuario es owner
      handleFilesUpload(['image'], process.env.PRODUCTS_FOLDER), // guarda la imagen en la carpeta
      ProductValidation.create, // ejecuta todas las validaciones del body de la creacion del producto
      handleValidation, // detecta errores de validacion
      ProductMiddleware.checkProductRestaurantOwnership, // vemos si el usuario es el propietario o no del resturante
      ProductController.create
    )
  app.route('/products/popular')
    .get(
      ProductController.popular
    )
  app.route('/products/:productId')
    .get(
      checkEntityExists(Product, 'productId'),
      ProductController.show)
    .put(
      isLoggedIn,
      hasRole('owner'),
      handleFilesUpload(['image'], process.env.PRODUCTS_FOLDER),
      checkEntityExists(Product, 'productId'),
      ProductMiddleware.checkProductOwnership,
      ProductValidation.update,
      handleValidation,
      ProductController.update
    )
    .delete(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Product, 'productId'),
      ProductMiddleware.checkProductOwnership,
      ProductMiddleware.checkProductHasNotBeenOrdered,
      ProductController.destroy
    )
}
export default loadFileRoutes
