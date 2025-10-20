const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const { execa } = require('execa');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const archiver = require('archiver');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, ownerAddress TEXT, type TEXT, name TEXT, transactionHash TEXT)");
});

app.get('/', (_req, res) => {
  res.json({ message: "I hope you are not alone. But if you are, then remember the last year you spent in your school and the first flight you had." });
});
const deployModule = async (req, res, moduleConfig) => {
  const { ownerAddress } = req.body;
  const { requiredFields, templateName, moveFileName, replacements, tomlAddressName, dbType, successMessage, errorMessage } = moduleConfig;

  if (!ownerAddress || requiredFields.some(field => !req.body[field])) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.copy(path.join(__dirname, 'templates', templateName), tempDir);

    const moveTemplatePath = path.join(tempDir, 'sources', moveFileName);
    let moveTemplate = await fs.readFile(moveTemplatePath, 'utf8');
    for (const replacement of replacements) {
      moveTemplate = moveTemplate.replace(new RegExp(replacement.search, 'g'), req.body[replacement.replace]);
    }
    await fs.writeFile(moveTemplatePath, moveTemplate);

    const moveTomlPath = path.join(tempDir, 'Move.toml');
    let moveToml = await fs.readFile(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(new RegExp(`${tomlAddressName} = "0x0"`, 'g'), `${tomlAddressName} = "${ownerAddress}"`);
    await fs.writeFile(moveTomlPath, moveToml);

    await execa('aptos', ['move', 'compile', '--named-addresses', `${tomlAddressName}=${ownerAddress}`], { cwd: tempDir });

    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `${tomlAddressName}=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, dbType, req.body.name, stdout]);
    res.json({ message: successMessage, transaction: stdout });
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    res.status(500).json({ error: errorMessage, details: error.message });
  } finally {
    await fs.remove(tempDir);
  }
};

app.post('/deploy', (req, res) => {
  deployModule(req, res, {
    requiredFields: ['name', 'symbol', 'decimals', 'supply'],
    templateName: 'fungible_token',
    moveFileName: 'my_token.move',
    replacements: [
      { search: '{{TOKEN_NAME}}', replace: 'name' },
      { search: '{{TOKEN_SYMBOL}}', replace: 'symbol' },
      { search: '{{TOKEN_DECIMALS}}', replace: 'decimals' },
      { search: '{{TOKEN_SUPPLY}}', replace: 'supply' }
    ],
    tomlAddressName: 'token_owner',
    dbType: 'token',
    successMessage: 'Deployment successful!',
    errorMessage: 'Deployment failed'
  });
});

app.post('/deploy-nft', (req, res) => {
  deployModule(req, res, {
    requiredFields: ['name', 'description', 'uri'],
    templateName: 'nft',
    moveFileName: 'my_nft.move',
    replacements: [
      { search: '{{COLLECTION_NAME}}', replace: 'name' },
      { search: '{{COLLECTION_DESCRIPTION}}', replace: 'description' },
      { search: '{{COLLECTION_URI}}', replace: 'uri' }
    ],
    tomlAddressName: 'nft_owner',
    dbType: 'nft',
    successMessage: 'NFT Collection deployment successful!',
    errorMessage: 'NFT Deployment failed'
  });
});

app.post('/deploy-dao', (req, res) => {
  deployModule(req, res, {
    requiredFields: ['name', 'delay'],
    templateName: 'dao',
    moveFileName: 'my_dao.move',
    replacements: [
      { search: '{{DAO_NAME}}', replace: 'name' },
      { search: '{{PROPOSAL_DELAY}}', replace: 'delay' }
    ],
    tomlAddressName: 'dao_owner',
    dbType: 'dao',
    successMessage: 'DAO deployment successful!',
    errorMessage: 'DAO Deployment failed'
  });
});

app.get('/projects/:ownerAddress', (req, res) => {
  const { ownerAddress } = req.params;
  db.all("SELECT * FROM projects WHERE ownerAddress = ?", [ownerAddress], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/project/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(row);
  });
});

const frontendTemplates = {
  token: {
    path: 'token/TokenComponent.jsx',
    replacements: [
      { search: /{{MODULE_ADDRESS}}/g, value: 'ownerAddress' },
      { search: /{{TOKEN_NAME}}/g, value: 'name' },
      { search: /{{TOKEN_SYMBOL}}/g, value: 'name' }
    ]
  },
  nft: {
    path: 'nft/NFTComponent.jsx',
    replacements: [
      { search: /{{MODULE_ADDRESS}}/g, value: 'ownerAddress' },
      { search: /{{COLLECTION_NAME}}/g, value: 'name' }
    ]
  },
  dao: {
    path: 'dao/DAOComponent.jsx',
    replacements: [
      { search: /{{MODULE_ADDRESS}}/g, value: 'ownerAddress' },
      { search: /{{DAO_NAME}}/g, value: 'name' }
    ]
  }
};

app.get('/generate-frontend/:projectId', (req, res) => {
  const { projectId } = req.params;
  db.get("SELECT * FROM projects WHERE id = ?", [projectId], async (err, project) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const templateConfig = frontendTemplates[project.type];
    if (!templateConfig) {
      return res.status(400).json({ error: "Invalid project type" });
    }

    const zip = archiver('zip');
    res.attachment('frontend-components.zip');
    zip.pipe(res);

    const templatePath = path.join(__dirname, 'templates', 'frontend', templateConfig.path);
    let template = await fs.readFile(templatePath, 'utf8');

    for (const replacement of templateConfig.replacements) {
      template = template.replace(replacement.search, project[replacement.value]);
    }

    zip.append(template, { name: path.basename(templateConfig.path) });
    zip.finalize();
  });
});

app.post('/deploy-visual', async (req, res) => {
  const { components, ownerAddress } = req.body;

  if (!components || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.ensureDir(path.join(tempDir, 'sources'));

    const moveFileNames = {
      'fungible_token': 'my_token.move',
      'nft': 'my_nft.move',
      'dao': 'my_dao.move',
      'staking': 'my_staking.move',
      'capped_fungible_token': 'my_capped_token.move',
      'governance': 'my_governance.move',
      'lending_pool': 'my_lending_pool.move',
    };

    let combinedCode = `module ${ownerAddress}::my_module {\n`;
    let combinedToml = `[package]\nname = "MyModule"\nversion = "1.0.0"\nauthors = ["dApp Builder"]\n\n[addresses]\nowner = "${ownerAddress}"\n\n[dependencies]\nAptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }\n`;

    for (const component of components) {
      const componentType = component.toLowerCase().replace(' ', '_');
      const templatePath = path.join(__dirname, 'templates', componentType);
      const moveFileName = moveFileNames[componentType];
      if (!moveFileName) {
        throw new Error(`Unknown component type: ${componentType}`);
      }
      const moveCode = await fs.readFile(path.join(templatePath, 'sources', moveFileName), 'utf8');
      combinedCode += moveCode.substring(moveCode.indexOf('{') + 1, moveCode.lastIndexOf('}'));

      const moveToml = await fs.readFile(path.join(templatePath, 'Move.toml'), 'utf8');
      const dependencies = moveToml.substring(moveToml.indexOf('[dependencies]') + 15);
      combinedToml += dependencies;
    }

    combinedCode += '\n}';

    await fs.writeFile(path.join(tempDir, 'sources', 'my_module.move'), combinedCode);
    await fs.writeFile(path.join(tempDir, 'Move.toml'), combinedToml);

    await execa('aptos', ['move', 'compile', '--named-addresses', `owner=${ownerAddress}`], { cwd: tempDir });
    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'visual', 'My Custom dApp', stdout]);
    res.json({ message: 'Visual deployment successful!', transaction: stdout });
  } catch (error) {
    console.error('Visual deployment failed:', error);
    res.status(500).json({ error: 'Visual deployment failed', details: error.message });
  } finally {
    await fs.remove(tempDir);
  }
});

app.post('/deploy-staking', (req, res) => {
  deployModule(req, res, {
    requiredFields: ['tokenModuleAddress'],
    templateName: 'staking',
    moveFileName: 'my_staking.move',
    replacements: [
      { search: '{{TOKEN_MODULE_ADDRESS}}', replace: 'tokenModuleAddress' }
    ],
    tomlAddressName: 'staking_owner',
    dbType: 'staking',
    successMessage: 'Staking contract deployment successful!',
    errorMessage: 'Staking deployment failed'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
