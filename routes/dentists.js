const express = require('express');  
const router = express.Router();  
//const {getDentists, getDentist, createDentist, updateDentist, deleteDentist} = require('../controllers/Dentists');
const {getDentists,getDentist, createDentist, updateDentist, deleteDentist} = require('../controllers/dentists');
const {protect, authorize} = require('../middleware/auth');
const appointmentRouter = require('./appointments');

router.use('/:dentistId/appointments/',appointmentRouter);

router.route('/').get(getDentists).post(protect, authorize('admin'), createDentist);
router.route('/:id').get(getDentist).put(protect, authorize('admin'), updateDentist).delete(protect, authorize('admin'), deleteDentist);

module.exports=router;

/**
 * @swagger  
 * components:  
 *   schemas:
 *     Dentist:
 *       type: object  
 *       required:  
 *         - name  
 *         - address
 *       properties:
 *         id:   
 *           type: string  
 *           format: uuid  
 *           description: The auto-generated id of the Dentist  
 *           example: d290f1ee-6c54-4b01-906e-d701748f0851  
 *         ลำดับ:
 *           type: string
 *           description: Ordinal number  
 *         name:  
 *           type: string  
 *           description: Dentist name  
 *         address:  
 *           type: string  
 *           description: House No., Street, Road  
 *         district:  
 *           type: string  
 *           description: District  
 *         province:  
 *           type: string  
 *           description: province  
 *         postalcode:  
 *           type: string  
 *           description: 5-digit postal code  
 *         tel:  
 *           type: string  
 *           description: telephone number  
 *         region:  
 *           type: string  
 *           description: region  
 *         example:  
 *           id: 609bda561452224d88d36e37  
 *           ลำดับ: 121  
 *           name: Happy Dentist  
 *           address: 121 ถนนชูจิต  
 *           district: บางนา  
 *           province: กรุงเทพมหานคร  
 *           postalcode: 10110  
 *           tel: 02-2187000  
 *           region: กรุงเทพมหานคร (Bangkok)
 */

/**
* @swagger
* tags:
*   name: Dentists
*   description: The Dentists managing API
*/

/**
* @swagger
* /Dentists:
*   get:
*     summary: Returns the list of all the Dentists
*     tags: [Dentists]
*     responses:
*       200:
*         description: The list of the Dentists
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Dentist'
*/

/**
* @swagger
* /Dentists/{id}:
*   get:
*     summary: Get the Dentist by id
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The Dentist id
*     responses:
*       200:
*         description: The Dentist description by id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Dentist'
*       404:
*         description: The Dentist was not found
*/

/**
* @swagger
* /Dentists:
*   post:
*     summary: Create a new Dentist
*     tags: [Dentists]
*     requestBody:
*       required: true
*       content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Dentist'
*     responses:
*       201:
*         description: The Dentist was successfully created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Dentist'
*       500:
*         description: Some server error
*/

/**
* @swagger
* /Dentists/{id}:
*   put:
*     summary: Update the Dentist by id
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The Dentist id
*     requestBody:
*       required: true
*       content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Dentist'
*     responses:
*       200:
*         description: The Dentist was updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Dentist'
*       404:
*         description: The Dentist was not found
*       500:
*         description: Some server error
*/

/**
* @swagger
* /Dentists/{id}:
*   delete:
*     summary: Remove the Dentist by id
*     tags: [Dentists]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The Dentist id
*     responses:
*       200:
*         description: The Dentist was deleted
*       404:
*         description: The Dentist was not found
*/