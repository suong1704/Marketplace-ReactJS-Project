
// module.exports = (plugin) => {
//   plugin.controllers.user.register = async (ctx) => {
//     try {
//       const newUser = await strapi
//         .query("plugin::users-permissions.user")
//         .create({
//           data: ctx.request.body,
//         });

//       ctx.body = {
//         _id: newUser.id,
//       };
//     } catch (error) {
//         ctx.body = {
//           error: [["This email address is already in use."]],
//         };
     
//     }
//   };

//   plugin.routes["content-api"].routes.push({
//     method: "POST",
//     path: "/auth/register",
//     handler: "auth.register",
//     config: {
//       prefix: "",
//       policies: [],
//     },
//   });

//   return plugin;
// };
module.exports = (plugin) => {
  plugin.controllers.user.register = async (ctx) => {
    const { email, password, username, phoneNumber, repeatPassword } = ctx.request.body;
    const errors = [];
    const existingUser = await strapi
    .query("plugin::users-permissions.user")
    .findOne({ email: email });
    const existingUsername = await strapi
    .query("plugin::users-permissions.user")
    .findOne({ username: username });
    console.log(existingUser)
    // if (existingUser) {
    // errors.push("This email address is already in use.")
    // }
    // if (existingUsername) {
    // errors.push("This username is already existing.")
    // }
    if (username.length < 3 || username.length > 50) errors.push('Name should be at least 3 characters long and max 50 characters long; ')
    if (/(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) == false) errors.push('Phone number should be a valid BG number; ' );
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false) errors.push("Please fill a valid email address; " );
    if (password !== repeatPassword) errors.push("Passwords should match; " );
    if (password.length < 8) errors.push("Password should be at least 8 characters long; " );
    if (password.length > 20) errors.push("Password should be at max 20 characters long; " );
   
    if (errors.length !== 0) {
        return (ctx.body = {
          error: [errors],
        });
    }
    else {
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

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/register",
    handler: "user.register",
    config: {
      prefix: "",
      policies: [],
    },
  });

  return plugin;
};
