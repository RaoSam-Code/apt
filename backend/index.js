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

app.get('/',async (_req,res)=>{
  return res("I hope you are not alone\n But if you are\n Then remember of last year you spent in your school and first Flight you had");
})
app.post('/deploy', async (req, res) => {
  const { name, symbol, decimals, supply, ownerAddress } = req.body;

  if (!name || !symbol || !decimals || !supply || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    // 1. Create a temporary directory
    await fs.ensureDir(tempDir);

    // 2. Copy the Move template
    await fs.copy(path.join(__dirname, 'templates', 'fungible_token'), tempDir);

    // 3. Replace placeholders in the Move template
    const moveTemplatePath = path.join(tempDir, 'sources', 'my_token.move');
    let moveTemplate = await fs.readFile(moveTemplatePath, 'utf8');
    moveTemplate = moveTemplate.replace(/{{TOKEN_NAME}}/g, name);
    moveTemplate = moveTemplate.replace(/{{TOKEN_SYMBOL}}/g, symbol);
    moveTemplate = moveTemplate.replace(/{{TOKEN_DECIMALS}}/g, decimals);
    moveTemplate = moveTemplate.replace(/{{TOKEN_SUPPLY}}/g, supply);
    await fs.writeFile(moveTemplatePath, moveTemplate);

    // 4. Update Move.toml with the owner's address
    const moveTomlPath = path.join(tempDir, 'Move.toml');
    let moveToml = await fs.readFile(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(/token_owner = "0x0"/g, `token_owner = "${ownerAddress}"`);
    await fs.writeFile(moveTomlPath, moveToml);

    // 5. Compile the Move code
    await execa('aptos', ['move', 'compile', '--named-addresses', `token_owner=${ownerAddress}`], { cwd: tempDir });

    // 6. Publish the compiled module
    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `token_owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'token', name, stdout]);
    res.json({ message: 'Deployment successful!', transaction: stdout });
  } catch (error) {
    console.error('Deployment failed:', error);
    res.status(500).json({ error: 'Deployment failed', details: error.message });
  } finally {
    // Clean up the temporary directory
    await fs.remove(tempDir);
  }
});

app.post('/deploy-nft', async (req, res) => {
  const { name, description, uri, ownerAddress } = req.body;

  if (!name || !description || !uri || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.copy(path.join(__dirname, 'templates', 'nft'), tempDir);

    const moveTemplatePath = path.join(tempDir, 'sources', 'my_nft.move');
    let moveTemplate = await fs.readFile(moveTemplatePath, 'utf8');
    moveTemplate = moveTemplate.replace(/{{COLLECTION_NAME}}/g, name);
    moveTemplate = moveTemplate.replace(/{{COLLECTION_DESCRIPTION}}/g, description);
    moveTemplate = moveTemplate.replace(/{{COLLECTION_URI}}/g, uri);
    await fs.writeFile(moveTemplatePath, moveTemplate);

    const moveTomlPath = path.join(tempDir, 'Move.toml');
    let moveToml = await fs.readFile(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(/nft_owner = "0x0"/g, `nft_owner = "${ownerAddress}"`);
    await fs.writeFile(moveTomlPath, moveToml);

    await execa('aptos', ['move', 'compile', '--named-addresses', `nft_owner=${ownerAddress}`], { cwd: tempDir });

    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `nft_owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'nft', name, stdout]);
    res.json({ message: 'NFT Collection deployment successful!', transaction: stdout });
  } catch (error) {
    console.error('NFT Deployment failed:', error);
    res.status(500).json({ error: 'NFT Deployment failed', details: error.message });
  } finally {
    await fs.remove(tempDir);
  }
});

app.post('/deploy-dao', async (req, res) => {
  const { name, delay, ownerAddress } = req.body;

  if (!name || !delay || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.copy(path.join(__dirname, 'templates', 'dao'), tempDir);

    const moveTemplatePath = path.join(tempDir, 'sources', 'my_dao.move');
    let moveTemplate = await fs.readFile(moveTemplatePath, 'utf8');
    moveTemplate = moveTemplate.replace(/{{DAO_NAME}}/g, name);
    moveTemplate = moveTemplate.replace(/{{PROPOSAL_DELAY}}/g, delay);
    await fs.writeFile(moveTemplatePath, moveTemplate);

    const moveTomlPath = path.join(tempDir, 'Move.toml');
    let moveToml = await fs.readFile(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(/dao_owner = "0x0"/g, `dao_owner = "${ownerAddress}"`);
    await fs.writeFile(moveTomlPath, moveToml);

    await execa('aptos', ['move', 'compile', '--named-addresses', `dao_owner=${ownerAddress}`], { cwd: tempDir });

    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `dao_owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'dao', name, stdout]);
    res.json({ message: 'DAO deployment successful!', transaction: stdout });
  } catch (error) {
    console.error('DAO Deployment failed:', error);
    res.status(500).json({ error: 'DAO Deployment failed', details: error.message });
  } finally {
    await fs.remove(tempDir);
  }
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

app.get('/generate-frontend/:projectId', (req, res) => {
  const { projectId } = req.params;
  db.get("SELECT * FROM projects WHERE id = ?", [projectId], async (err, project) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const zip = archiver('zip');
    res.attachment('frontend-components.zip');
    zip.pipe(res);

    if (project.type === 'token') {
      const templatePath = path.join(__dirname, 'templates', 'frontend', 'token', 'TokenComponent.jsx');
      let template = await fs.readFile(templatePath, 'utf8');
      template = template.replace(/{{MODULE_ADDRESS}}/g, project.ownerAddress);
      template = template.replace(/{{TOKEN_NAME}}/g, project.name);
      template = template.replace(/{{TOKEN_SYMBOL}}/g, project.name); // Assuming symbol is same as name for now
      zip.append(template, { name: 'TokenComponent.jsx' });
    } else if (project.type === 'nft') {
      const templatePath = path.join(__dirname, 'templates', 'frontend', 'nft', 'NFTComponent.jsx');
      let template = await fs.readFile(templatePath, 'utf8');
      template = template.replace(/{{MODULE_ADDRESS}}/g, project.ownerAddress);
      template = template.replace(/{{COLLECTION_NAME}}/g, project.name);
      zip.append(template, { name: 'NFTComponent.jsx' });
    } else if (project.type === 'dao') {
      const templatePath = path.join(__dirname, 'templates', 'frontend', 'dao', 'DAOComponent.jsx');
      let template = await fs.readFile(templatePath, 'utf8');
      template = template.replace(/{{MODULE_ADDRESS}}/g, project.ownerAddress);
      template = template.replace(/{{DAO_NAME}}/g, project.name);
      zip.append(template, { name: 'DAOComponent.jsx' });
    }

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

    let combinedCode = `module ${ownerAddress}::my_module {\n`;
    let combinedToml = `[package]\nname = "MyModule"\nversion = "1.0.0"\nauthors = ["dApp Builder"]\n\n[addresses]\nowner = "${ownerAddress}"\n\n[dependencies]\nAptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }\n`;

    for (const component of components) {
      const componentType = component.toLowerCase().replace(' ', '_');
      const templatePath = path.join(__dirname, 'templates', componentType);
      const moveCode = await fs.readFile(path.join(templatePath, 'sources', `my_${componentType}.move`), 'utf8');
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

app.post('/deploy-staking', async (req, res) => {
  const { tokenModuleAddress, ownerAddress } = req.body;

  if (!tokenModuleAddress || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.copy(path.join(__dirname, 'templates', 'staking'), tempDir);

    const moveTemplatePath = path.join(tempDir, 'sources', 'my_staking.move');
    let moveTemplate = await fs.readFile(moveTemplatePath, 'utf8');
    moveTemplate = moveTemplate.replace(/{{TOKEN_MODULE_ADDRESS}}/g, tokenModuleAddress);
    await fs.writeFile(moveTemplatePath, moveTemplate);

    const moveTomlPath = path.join(tempDir, 'Move.toml');
    let moveToml = await fs.readFile(moveTomlPath, 'utf8');
    moveToml = moveToml.replace(/staking_owner = "0x0"/g, `staking_owner = "${ownerAddress}"`);
    await fs.writeFile(moveTomlPath, moveToml);

    await execa('aptos', ['move', 'compile', '--named-addresses', `staking_owner=${ownerAddress}`], { cwd: tempDir });

    const { stdout } = await execa('aptos', ['move', 'publish', '--named-addresses', `staking_owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'staking', 'My Staking Contract', stdout]);
    res.json({ message: 'Staking contract deployment successful!', transaction: stdout });
  } catch (error) {
    console.error('Staking deployment failed:', error);
    res.status(500).json({ error: 'Staking deployment failed', details: error.message });
  } finally {
    await fs.remove(tempDir);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
