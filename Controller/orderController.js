
let asyncHandler= require('./../Utlis/asyncHandlerFunc');
let customError= require('./../Utlis/customError');
let orderModel= require('./../Model/order');
let shoppingCartModel= require('./../Model/shoppingCart');
let productModel = require('./../Model/product')



//access request body

//desc: create a order using cash as payement method
//routr:Post /order/:cartID
//access: protectedRoute +users

exports.createCashOrder= asyncHandler(async (request, response, next)=>{
    let totalPrice;
    //1- get the cart using the CartID
    let foundCart= await shoppingCartModel.findById(request.params.cartID);
    if (!foundCart)
        return next(new customError('cart is NOT FOUND',404))
    console.log(foundCart);
    //2-get totalprice and check if there is a coupon
    if(foundCart.totalPriceAfterDiscount)
  totalPrice = Number(foundCart.totalPriceAfterDiscount) + Number(request.body.shippingPrice || 0) + Number(request.body.taxPrice || 0);
else
  totalPrice = Number(foundCart.totalPrice) + Number(request.body.shippingPrice || 0) + Number(request.body.taxPrice || 0);

    //3- create an order
    let newOrder= await orderModel.create({
        user:request.foundUser._id,
        cartItems:foundCart.cartItems,
        totalPrice:totalPrice,
        shippingPrice:request.body.shippingPrice,
        taxPrice: request.body.taxPrice

    });
    if (!newOrder)
        return next(new customError('order is not created',400))
    //4- update quantity and sold in product model khali balek product is an array
    let bulkOperations = foundCart.cartItems.map(item => ({
        updateOne: { 
            filter: { _id: item.product },
            update: { 
                $inc: {
                    quantity: -item.quantity,
                    quantityOfSoldProduct: +item.quantity
                }
            }
        }}))
     await productModel.bulkWrite(bulkOperations,{})
    
 
//5- clear the cart based on cartId
await shoppingCartModel.findByIdAndDelete(request.params.cartID);

//send response to frontend
response.status(200).json({
    status:'Success',
    order:newOrder
})
})

//desc: get all orders
//routr:Post /order/:cartID
//access: protectedRoute +admin
exports.getAllorders = async (request, response, next) => {
    try {
        console.log('getAllorders called');
        console.log('next type:', typeof next);
        const orders = await orderModel.find();
        console.log('orders found:', orders.length);
        response.status(200).json({
            status: 'success',
            orders: orders
        });
    } catch(err) {
        console.error('Error in getAllorders:', err.message);
        response.status(500).json({ status: 'Error', Message: err.message });
    }
};

//desc: get user orders
//routr:Post /order/:cartID
//access: protectedRoute +user

exports.getOrder = asyncHandler(async (request, response, next) => {
    let foundOrders = await orderModel.find({ user: request.foundUser._id })
        .populate('cartItems.product', 'title price')
        .sort('-createdAt');

    response.status(200).json({
        status: 'success',
        orders: foundOrders
    });
});
//desc: update order is paid 
//routr:Post /order/isPaid/:orderId
//access: protectedRoute +admin
exports.updateOrderIsPaid= asyncHandler(async(request, response, next)=>{
    let updatedOrder= await orderModel.findByIdAndUpdate(request.params.orderId,{
        isPaid:true,
        paidAt:Date.now()
    }, {new:true,
        runValidators:true
    })
    if (!updatedOrder)
        return next(new customError('order NOT FOUND'),404);
    response.status(200).json({
        status:'success',
        updatedOrder:updatedOrder
    })

})

//desc: update order is deleveried  
//routr:Post /order/isDelivered/:orderId
//access: protectedRoute +admin
exports.updateOrderIsDelivered= asyncHandler(async(request, response, next)=>{
    let updatedOrder= await orderModel.findByIdAndUpdate(request.params.orderId,{
        isDelivered:true,
        deliveredAt:Date.now()
    }, {new:true,
        runValidators:true
    })
    if(!updatedOrder)
    return next(new customError('order NOT FOUND'),404);
    response.status(200).json({
        status:'success',
        updatedOrder:updatedOrder
    })

})


//desc: create a checkout-session to send total price foe the user 
//routr:Post /order/checkout-session/:cartID
//access: protectedRoute +user



