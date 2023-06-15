'use strict';

/**
 * block-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::block-list.block-list');
