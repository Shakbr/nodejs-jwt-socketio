import { io } from '../../server.js'

const getFilteredData = async (req, res) => {
  try {
    // const order = new Order(req.body)
    // await order.save()
    // const orders = await Order.find()
    const order = "test Orderrrrrrrr";
    const orders = "test Orders";
    io.emit('order-added', orders)
    res.status(201).send(order)
  } catch (error) {
    res.send(error)
  }
}

export {
  getFilteredData
}
