module.exports = (plugin) => {
  plugin.controllers.user.register = async (ctx) => {
    const { email, password, name, phoneNumber, repeatPassword } =
      ctx.request.body;
    const errors = [];
    console.log(email);
    const existingUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email } });
    const existingUsername = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { name: username } });
    console.log(existingUser);
    if (existingUser) {
      errors.push("This email address is already in use.");
    }
    if (existingUsername) {
      errors.push("This username is already existing.");
    }
    if (name.length < 3 || name.length > 50)
      errors.push(
        "Name should be at least 3 characters long and max 50 characters long; "
      );
    if (
      /(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) == false
    )
      errors.push("Phone number should be a valid BG number; ");
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false)
      errors.push("Please fill a valid email address; ");
    if (password !== repeatPassword) errors.push("Passwords should match; ");
    if (password.length < 8)
      errors.push("Password should be at least 8 characters long; ");
    if (password.length > 20)
      errors.push("Password should be at max 20 characters long; ");

    if (errors.length !== 0) {
      return (ctx.body = {
        error: [errors],
      });
    } else {
      const newUser = await strapi
        .query("plugin::users-permissions.user")
        .create({
          data: ctx.request.body,
        });
      ctx.body = {
        _id: newUser.id,
      };
      ctx.response.status = 200;
    }
  };
  plugin.controllers.user.getUser = async (ctx) => {
    const { id } = ctx.params;
    const errors = [];
    console.log(id);
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: id } });

    console.log(user);

    (ctx.body = {
      user: {
        _id: user.id,
        name: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        totalSells: 9,
        avatar: user.avatar,
        isMe: true,
      },
    }),
      (ctx.response.status = 200);
  };
  /* custom login */

  // plugin.controllers.user.login = async (ctx) => {
  //   const { email, password } = ctx.request.body;

  //   const user = await strapi.plugins[
  //     "users-permissions"
  //   ].services.auth.localEmailLogin({
  //     email,
  //     password,
  //   });

  //   if (!user) {
  //     return ctx.body({ error: [["Đăng nhập thất bại."]] });
  //   } else {
  //     return ctx.body({ error: [["Đăng nhập ok"]] });
  //   }

  // ctx.send({
  //   user: sanitizeEntity(user, {
  //     model: strapi.plugins["plugin::users-permissions.user"].models.user,
  //   }),
  //   token: await strapi.plugins[
  //     "plugin::users-permissions.user"
  //   ].services.jwt.issue(user),
  // });
  // };

  plugin.controllers.user.getUserById = async (ctx) => {
    const { id } = ctx.params;
    const errors = [];
    console.log(id);
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: id } });

    console.log(user);

    (ctx.body = {
      user: {
        _id: user.id,
        name: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        totalSells: 9,
        avatar: user.avatar,
        isMe: true,
      },
    }),
      (ctx.response.status = 200);
  };

  plugin.controllers.user.editUserProfile = async (ctx) => {
    const { id } = ctx.params;
    let { name, phoneNumber, email } = ctx.request.body;
    const errors = [];

    const checkUser = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: id } });

    if (checkUser && checkUser.id.toString() !== id.toString())
      errors.push("This email address is already in use; ");
    if (name.length < 3 || name.length > 50)
      errors.push(
        "Name should be at least 3 characters long and max 50 characters long; "
      );
    if (
      /(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) == false
    )
      errors.push("Phone number should be a valid BG number; ");
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false)
      errors.push("Please fill a valid email address; ");

    if (errors.length !== 0) {
      return (ctx.body = {
        error: [errors],
      });
    } else {
      const newUser = await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: id },
          data: {
            ...ctx.request.body,
            username: name,
          },
        });

      ctx.body = {
        message: "Updated!",
      };

      ctx.response.status = 200;
    }
  };
  plugin.controllers.user.getUserWishlist = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: id },
        populate: {
          wishedProducts: {
            select: [
              "id",
              "active",
              "title",
              "price",
              "description",
              "city",
              "category",
              "image",
              "addedAt",
            ],
            populate: {
              likes: {
                select: ["id"],
              },
              seller: {
                select: ["id"],
              },
            },
          },
        },
      });

    let result = [];
    if (user.wishedProducts && Array.isArray(user.wishedProducts)) {
      result = user.wishedProducts.reduce((acc, item) => {
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
          active: item.active,
          __v: 0,
        });
        return acc;
      }, []);
    }

    (ctx.body = {
      wishlist: result,
    }),
      (ctx.response.status = 200);
  };
  plugin.controllers.user.getUserActiveSells = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: id },
        populate: {
          createdSells: {
            select: [
              "id",
              "active",
              "title",
              "price",
              "description",
              "city",
              "category",
              "image",
              "addedAt",
            ],
            where: { active: true },
            populate: {
              likes: {
                select: ["id"],
              },
              seller: {
                select: ["id"],
              },
            },
          },
        },
      });

    let result = [];
    if (user.createdSells && Array.isArray(user.createdSells)) {
      result = user.createdSells.reduce((acc, item) => {
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
          active: item.active,
          __v: 0,
        });
        return acc;
      }, []);
    }

    (ctx.body = {
      sells: result,
      user: { ...user, _id: user.id },
    }),
      (ctx.response.status = 200);
  };
  plugin.controllers.user.getUserArchivedSells = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: id },
        populate: {
          createdSells: {
            select: [
              "id",
              "active",
              "title",
              "price",
              "description",
              "city",
              "category",
              "image",
              "addedAt",
            ],
            where: { active: false },
            populate: {
              likes: {
                select: ["id"],
              },
              seller: {
                select: ["id"],
              },
            },
          },
        },
      });

    let result = [];
    if (user.createdSells && Array.isArray(user.createdSells)) {
      result = user.createdSells.reduce((acc, item) => {
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
          active: item.active,
          __v: 0,
        });
        return acc;
      }, []);
    }

    (ctx.body = {
      sells: result,
      user: { ...user, _id: user.id },
    }),
      (ctx.response.status = 200);
  };
  plugin.controllers.user.wishProduct = async (ctx) => {
    try {
      const { id } = ctx.params;
      let { userId } = ctx.request.body;
      console.log(userId);

      const checkUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      ctx.body = {
        message: "Updated!",
      };

      ctx.response.status = 200;
    } catch (error) {}
  };
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/register",
    handler: "user.register",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/getUser",
    handler: "user.getUser",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/login",
    handler: "user.login",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/getUserById/:id",
    handler: "user.getUserById",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/user/edit-profile/:id",
    handler: "user.editUserProfile",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/wishlist/:id",
    handler: "user.getUserWishlist",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/sells/active/:id",
    handler: "user.getUserActiveSells",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/sells/archived/:id",
    handler: "user.getUserArchivedSells",
    config: {
      prefix: "",
      policies: [],
    },
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/products/wish/:id",
    handler: "user.wishProduct",
    config: {
      prefix: "",
      policies: [],
    },
  });
  return plugin;
};
