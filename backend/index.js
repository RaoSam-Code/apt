const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const execa = require('execa');
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
  res.json({ message: "Aptos Visual Builder Backend Running" });
});

// ... (keep existing deployModule and single-module endpoints for backward compatibility if needed, or remove them. I'll keep them for now but focus on the new one)

const MODULE_TEMPLATES = {
  'my_token': {
    file: 'my_token.move',
    templateDirs: ['fungible_token'],
  },
  'my_nft': {
    file: 'my_nft.move',
    templateDirs: ['nft'],
  },
  'my_dao': {
    file: 'my_dao.move',
    templateDirs: ['dao'],
  },
  'my_staking': {
    file: 'my_staking.move',
    templateDirs: ['staking'],
  }
  // Add others...
};

// Helper to map frontend node types to backend template keys
const getNodeTypeParams = (nodeType) => {
  const map = {
    'token': 'my_token',
    'nft collection': 'my_nft',
    'dao': 'my_dao',
    'staking': 'my_staking',
    // fallback
    'module': 'my_token'
  };
  return map[nodeType.toLowerCase()] || 'my_token';
};

app.post('/deploy-graph', async (req, res) => {
  console.log('Received request to /deploy-graph');
  const { graph, ownerAddress } = req.body;

  if (!graph || !graph.nodes || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tempDir = path.join(__dirname, 'temp', Date.now().toString());

  try {
    await fs.ensureDir(tempDir);
    await fs.ensureDir(path.join(tempDir, 'sources'));

    // 1. Generate Move.toml
    let combinedToml = `[package]\nname = "VisualApp"\nversion = "1.0.0"\nauthors = ["Visual Builder"]\n\n[addresses]\nowner = "${ownerAddress}"\n\n[dependencies]\nAptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }\n`;
    await fs.writeFile(path.join(tempDir, 'Move.toml'), combinedToml);

    // 2. Process Nodes and Generate Modules
    // For now, we simply dump each node's module into sources/ taking care of naming collisions

    for (const node of graph.nodes) {
      // Determine template based on node type/data
      // For the MVP, we assume node.data.label maps loosely to a template or we use node.type
      // In the future, node.data.type should be explicit

      const templateKey = getNodeTypeParams(node.data.label);
      const templateConfig = MODULE_TEMPLATES[templateKey];

      if (!templateConfig) {
        console.warn(`No template found for ${node.data.label}, skipping.`);
        continue;
      }

      // Read the template content
      // We look in templates/<template_dir>/sources/<file>
      // We might need to iterate if multiple dirs
      const templateDir = templateConfig.templateDirs[0];
      const sourcePath = path.join(__dirname, 'templates', templateDir, 'sources', templateConfig.file);

      try {
        let content = await fs.readFile(sourcePath, 'utf8');

        // Rename module to avoid collision if multiple of same type
        // e.g. module owner::my_token -> module owner::my_token_nodeId
        const uniqueModuleName = `${templateKey}_${node.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
        content = content.replace(new RegExp(`module\\s+\\w+::${templateKey}`, 'g'), `module owner::${uniqueModuleName}`);

        // Standard Replacements from Node Data (MVP)
        // Ideally we pass specific fields from the node configuration form
        content = content.replace(/{{TOKEN_NAME}}/g, node.data.name || 'My Token');
        content = content.replace(/{{TOKEN_SYMBOL}}/g, node.data.symbol || 'MYT');

        // Write to sources
        await fs.writeFile(path.join(tempDir, 'sources', `${uniqueModuleName}.move`), content);

      } catch (e) {
        console.error(`Failed to process node ${node.id}:`, e);
        // Continue or fail?
      }
    }

    // 3. Compile
    console.log('Compiling...');
    const compileResult = await execa('aptos', ['move', 'compile', '--named-addresses', `owner=${ownerAddress}`, '--save-metadata'], { cwd: tempDir });
    console.log('Compiled:', compileResult.stdout);

    // 4. Publish
    console.log('Publishing...');
    const publishResult = await execa('aptos', ['move', 'publish', '--named-addresses', `owner=${ownerAddress}`, '--assume-yes'], { cwd: tempDir });
    console.log('Published:', publishResult.stdout);

    db.run("INSERT INTO projects (ownerAddress, type, name, transactionHash) VALUES (?, ?, ?, ?)", [ownerAddress, 'graph', 'Visual Project', publishResult.stdout]);
    res.json({ message: 'Visual deployment successful!', transaction: publishResult.stdout });

  } catch (error) {
    console.error('Deployment error:', error);
    // Provide stderr if available from execa
    const details = error.stderr || error.message;
    res.status(500).json({ error: 'Deployment failed', details });
  } finally {
    await fs.remove(tempDir);
  }
});

// ... (Rest of existing code, mainly app.listen)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
