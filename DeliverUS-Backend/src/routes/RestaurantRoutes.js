import * as RestaurantValidation from '../controllers/validation/RestaurantValidation.js'
import * as RestaurantMiddleware from '../middlewares/RestaurantMiddleware.js'
import OrderController from '../controllers/OrderController.js'
import ProductController from '../controllers/ProductController.js'
import RestaurantController from '../controllers/RestaurantController.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import { handleFilesUpload } from '../middlewares/FileHandlerMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
import { Restaurant } from '../models/models.js'

const loadFileRoutes = function (app) {
  app.route('/restaurants')
    .get(
      // lista de los restaurantes es publica, entonces no tenemos que estar logueados ni nada
      RestaurantController.index)
    .post(
    // TODO: Add needed middlewares
    // Para crear un restaurante deberia estar logueado, ademas debe ser un owner,
    // puede tener archivos (imagenes del restaurante y el logo)
    // pasamos las validaciones para crear un restaurante y vemos si hay errores de validacion con handleValidation
    // y creamos el restaurante
      isLoggedIn,
      hasRole('owner'),
      handleFilesUpload(['logo', 'heroImage'], process.env.RESTAURANT_FOLDER),
      RestaurantValidation.create,
      handleValidation,
      RestaurantController.create)

  app.route('/restaurants/:restaurantId')
    .get(
      checkEntityExists(Restaurant, 'restaurantId'),
      RestaurantController.show)
    .put(
      // para poder editar necesitamos estar logueados y ademas ser propietario del restaurante
      // checkeamos que exista el restaurante y checkear si eres propietario
      // tambien puede tener archivos para cambiar las imagenes o logo
      // validamos las validaciones para actualizar y vemos si hay errores de validacion
    // TODO: Add needed middlewares
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Restaurant, 'restaurantId'),
      RestaurantMiddleware.checkRestaurantOwnership,
      handleFilesUpload(['logo', 'heroImage'], process.env.RESTAURANT_FOLDER),
      RestaurantValidation.update,
      handleValidation,
      RestaurantController.update)
    .delete(
    // TODO: Add needed middlewares
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Restaurant, 'restaurantId'),
      RestaurantMiddleware.restaurantHasNoOrders, // es importante checkear que el restaurante no tenga pedidos
      RestaurantMiddleware.checkRestaurantOwnership,
      RestaurantController.destroy)

  app.route('/restaurants/:restaurantId/orders')
    .get(
    // TODO: Add needed middlewares
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Restaurant, 'restaurantId'),
      RestaurantMiddleware.checkRestaurantOwnership,
      OrderController.indexRestaurant)

  app.route('/restaurants/:restaurantId/products')
    .get(
    // TODO: Add needed middlewares
      checkEntityExists(Restaurant, 'restaurantId'),
      ProductController.indexRestaurant)

  app.route('/restaurants/:restaurantId/analytics')
    .get(
    // TODO: Add needed middlewares
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Restaurant, 'restaurantId'),
      RestaurantMiddleware.checkRestaurantOwnership,
      OrderController.analytics)
}
export default loadFileRoutes
