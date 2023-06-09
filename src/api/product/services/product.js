"use strict";

/**
 * product service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::product.product", ({ strapi }) => ({
  async find() {
    try {
      const entries = await strapi.db
        .query("api::product.product")
        .findMany({ offset: 0, limit: 10 });

      let result;
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];
          acc.push({
            _id: item.id,
            likes: item.likes || [],
            category: item.category || "",
            title: item.title || "",
            price: item.price || 0,
            description: item.description || 0,
            city: item.city || "",
            image: item.image || 0,
            addedAt: item.addedAt || 0,
            seller: item.seller || 0,
            description: item.description || 0,
            __v: 0,
          });
          return acc;
        }, []);
      }
      return { products: result };
    } catch (error) {}
  },

  async getSpecific(ctx) {
    try {
      const { id } = ctx.params;
      const entries = await strapi.db.query("api::product.product").findMany({
        where: { id: id },
        populate: {
          seller: {
            select: ["id"],
          },
          likes: {
            select: ["id"],
          },
        },
      });

      let result;
      if (entries && Array.isArray(entries)) {
        result = entries.reduce((acc, item) => {
          acc = acc || [];
          let likes = [];
          item.likes.map((i) => {
            likes.push(String(i.id));
          });
          acc.push({
            _id: String(item.id),
            likes: likes,
            category: item.category || "",
            title: item.title || "",
            price: item.price || 0,
            description: item.description || "",
            city: item.city || "",
            image: item.image || "",
            addedAt: item.addedAt || "",
            seller: String(item.seller.id) || "",
            name: item.seller.username || "",
            phoneNumber: item.seller.phoneNumber || "",
            email: item.seller.email || "",
            avatar: item.seller.avatar || "",
            sellerId: item.seller.id || "",
            active: item.active,
            createdSells: 0,
            isAuth: true,
            isSeller: true,
            isWished: true,
            __v: 0,
          });
          return acc;
        }, []);
      }

      return result[0];
    } catch (error) {}
  },
  async createProduct(ctx) {
    try {
      const {userId, price} = ctx.request.body
      // const { token } = ctx.cookies;
      // user = await strapi.plugins["users-permissions"].services.jwt.getToken(
      //   token
      // );
      // if (!user) {
      //   return ctx.throw(401, "Invalid token");
      // }
      const product = await strapi.db.query("api::product.product").create({
        data: {
          ...ctx.request.body,
          price: Number(price),
          seller: Number(userId),
          creatAt: new Date(),
        },
      });
      ctx.response.status = 200;
      return {productId:  product.id};

    } catch (error) {}
  },
  async editProduct(ctx) {
    try {
      const { id } = ctx.params;
      const { title, price, description, city, category, image } =
        ctx.request.body;
      const errors = [];
      if (title.length < 3 || title.length > 50)
        errors.push(
          "Title should be at least 3 characters long and max 50 characters long; "
        );
      if (isNaN(Number(price))) errors.push("Price should be a number; ");
      if (description.length < 10 || description.length > 1000)
        errors.push(
          "Description should be at least 10 characters long and max 1000 characters long; "
        );
      if (/^[A-Za-z]+$/.test(city) == false)
        errors.push("City should contains only english letters; ");
      if (category === "" || category == "Choose...")
        errors.push("Category is required; ");

      /** UPLOAD IMAGE HERE*/

      if (errors.length !== 0) {
        return {
          error: [errors],
        };
      } else {
        const entry = await strapi.db.query("api::product.product").update({
          where: { id: id },
          data: { title, price, description, city, category, image },
        });
        ctx.response.status = 200;
        return { message: "Updated!" };
      }
    } catch (error) {}
  },
  async activateSell(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.db.query("api::product.product").update({
        where: { id: id },
        data: { active: true },
      });
      ctx.response.status = 200;
      return { msg: "Activated" };

      return result;
    } catch (error) {}
  },
  async archiveSell(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.db.query("api::product.product").update({
        where: { id: id },
        data: { active: false },
      });
      ctx.response.status = 200;
      return { msg: "Archived" };

      return result;
    } catch (error) {}
  },
}));
