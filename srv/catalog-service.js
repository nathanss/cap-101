const cds = require('@sap/cds');

module.exports = function (){
  this.after('READ','Books', each => {
    if (each.stock > 111) {
      each.title += ` -- 11% discount!`
    }
  })

  this.on ('submitOrder', async req => {
    const { book,amount } = req.data
    // const { stock } = await cds.read("stock").from("sap.capire.bookshop.Books",book)
    const [ { stock } ] = await cds.read("sap.capire.bookshop.Books").columns(["stock"]).where({
      ID: book
    });
    if (stock >= amount) {
      await cds.update("sap.capire.bookshop.Books",book) .with (`stock -=`, amount)
      return { stock }
    }
    else return req.error (409,`${amount} exceeds stock for book #${book}`)
  })

  this.on('getBooksCount', async() => {
    const [result] = await cds.run("SELECT SUM(stock) as totalStock FROM sap_capire_bookshop_Books");
    return result.totalStock;
  });
}