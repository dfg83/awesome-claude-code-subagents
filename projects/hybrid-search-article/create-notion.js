const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PARENT_PAGE_ID = '30c36888-7c48-8005-9ef0-df351874ea38';

const content = fs.readFileSync('article.md', 'utf8');

async function createArticle() {
  const page = await notion.pages.create({
    parent: { page_id: PARENT_PAGE_ID },
    properties: {
      title: {
        title: [{ text: { content: 'Hybrid Search & Contextual Retrieval: Die Zukunft der KI-gestützten Informationssuche' } }]
      }
    }
  });
  
  console.log('Page created:', page.id);
  
  const lines = content.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = '';
  
  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          object: 'block',
          type: 'code',
          code: { 
            rich_text: [{ type: 'text', text: { content: codeBuffer.join('\n') } }],
            language: codeLanguage || 'plain text'
          }
        });
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }
    
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] }
      });
    } else if (line.startsWith('- ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
      });
    } else if (line.startsWith('|')) {
      continue;
    } else if (line.trim() === '') {
      continue;
    } else if (line.startsWith('---')) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] }
      });
    }
    
    if (blocks.length >= 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: blocks
      });
      blocks.length = 0;
    }
  }
  
  if (blocks.length > 0) {
    await notion.blocks.children.append({
      block_id: page.id,
      children: blocks
    });
  }
  
  console.log('Article created successfully!');
  console.log('URL: https://notion.so/' + page.id.replace(/-/g, ''));
}

createArticle().catch(console.error);
