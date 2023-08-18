const { verifyRequestToken } = require('../utils/verify');
const authRouter = require('./auth_router');
const drawObjectRouter = require('./drawn_object_router');
const paperRouter = require('./paper_router');
const templateRouter = require('./template_router');

function router(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/paper', verifyRequestToken, paperRouter);
  app.use('/api/drawnObj', verifyRequestToken, drawObjectRouter);
  app.use('/api/template', verifyRequestToken, templateRouter);
}

module.exports = router;
