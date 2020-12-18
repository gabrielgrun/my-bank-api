import express from 'express';
import { promises as fs } from 'fs';

const router = express.Router();
const { readFile, writeFile } = fs;

router.post('/', async (req, res, next) => {
  try {
    let account = req.body;

    if (!account.name || account.balance == null) {
      throw new Error('Name e Balance são obrigatórios');
    }

    const jsonData = JSON.parse(await fs.readFile(global.fileName));

    account = {
      id: jsonData.nextId++,
      name: account.name,
      balance: account.balance,
    };

    jsonData.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(jsonData, null, 2));

    res.send(account);

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const jsonData = JSON.parse(await fs.readFile(global.fileName));
    delete jsonData.nextId;
    res.send(jsonData);

    logger.info(`GET /account`);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const jsonData = JSON.parse(await fs.readFile(global.fileName));
    const account = jsonData.accounts.find((account) => {
      return account.id === parseInt(req.params.id);
    });

    res.send(account);

    logger.info(`GET /account/:id`);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const jsonData = JSON.parse(await fs.readFile(global.fileName));
    jsonData.accounts = jsonData.accounts.filter((account) => {
      return account.id !== parseInt(req.params.id);
    });
    await writeFile(global.fileName, JSON.stringify(jsonData, null, 2));
    res.end();

    logger.info(`DELETE /account/:id - ${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    let account = req.body;
    const jsonData = JSON.parse(await fs.readFile(global.fileName));
    const index = jsonData.accounts.findIndex((currentAcount) => {
      return currentAcount.id === parseInt(account.id);
    });

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    if (!account.id || !account.name || account.balance == null) {
      throw new Error('Id, Name e Balance são obrigatórios');
    }

    jsonData.accounts[index].name = account.name;
    jsonData.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(jsonData, null, 2));

    res.send(account);

    logger.info(`PUT /account - ${JSON.stringify(account)}`);
  } catch (error) {
    next(error);
  }
});

router.patch('/updateBalance', async (req, res, next) => {
  try {
    let account = req.body;
    const jsonData = JSON.parse(await fs.readFile(global.fileName));
    const index = jsonData.accounts.findIndex((currentAcount) => {
      return currentAcount.id === parseInt(account.id);
    });

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    if (!account.id || account.balance == null) {
      throw new Error('Id e Balance são obrigatórios');
    }

    jsonData.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(jsonData, null, 2));

    res.send(jsonData.accounts[index]);

    logger.info(`PATCH /account/updateBalance - ${JSON.stringify(account)}`);
  } catch (error) {
    next(error);
  }
});

router.use((error, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${error.message}`);
  res.status(400).send({ error: error.message });
});

export default router;
