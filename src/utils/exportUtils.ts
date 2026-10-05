import { TutorialProject } from '../types';
import JSZip from 'jszip';

export const exportProjectAsJSON = (project: TutorialProject) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeName = (project.title || 'tutorial')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 40);
  downloadAnchor.setAttribute('download', `${safeName}_blueprint.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportProjectAsMarkdown = (project: TutorialProject) => {
  let md = `# ${project.title}\n\n`;
  md += `> **Description:** ${project.description}\n\n`;
  md += `| Metadata | Details |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Duration** | ${project.duration} |\n`;
  md += `| **Avatar** | ${project.avatar} |\n`;
  md += `| **Voice Profile** | ${project.voice} |\n`;
  md += `| **AI Router** | ${project.provider} (${project.model}) |\n`;
  md += `| **Created** | ${new Date(project.createdAt).toLocaleString()} |\n\n`;
  md += `## 🎬 Production Blueprint Steps\n\n`;
  
  (project.steps || []).forEach((step, idx) => {
    md += `### Step ${idx + 1} (${step.time})\n`;
    md += `- **Visual:** ${step.visual}\n`;
    md += `- **Spoken Script:** "${step.script}"\n\n`;
  });

  md += `---\n*Generated autonomously with [Xennials Automation Solutions](https://github.com/xennialsAi/xennials-automation)*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  const safeName = (project.title || 'tutorial')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 40);
  downloadAnchor.setAttribute('download', `${safeName}_blueprint.md`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportProjectsAsJSON = (projects: TutorialProject[], fileName = 'xennials_tutorials_archive') => {
  if (projects.length === 0) return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${fileName}_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportProjectsAsCSV = (projects: TutorialProject[], fileName = 'xennials_tutorials_archive') => {
  if (projects.length === 0) return;

  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value);
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  const headers = [
    'ID',
    'Title',
    'Description',
    'Duration',
    'Avatar',
    'Voice',
    'Provider',
    'Model',
    'Status',
    'Created At',
    'Steps Count',
    'Full Script Summary',
  ];

  const rows = projects.map((proj) => {
    const fullScript = (proj.steps || [])
      .map((s, idx) => `[Step ${idx + 1} (${s.time})] Visual: ${s.visual} | Script: ${s.script}`)
      .join(' ;; ');

    return [
      escapeCSV(proj.id),
      escapeCSV(proj.title),
      escapeCSV(proj.description),
      escapeCSV(proj.duration),
      escapeCSV(proj.avatar),
      escapeCSV(proj.voice),
      escapeCSV(proj.provider),
      escapeCSV(proj.model),
      escapeCSV(proj.status),
      escapeCSV(proj.createdAt),
      escapeCSV(proj.steps?.length || 0),
      escapeCSV(fullScript),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `${fileName}_${Date.now()}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportProjectsBatchAsZip = async (projects: TutorialProject[]) => {
  if (projects.length === 0) return;
  const zip = new JSZip();

  const folder = zip.folder('xennials_tutorials');

  projects.forEach((proj, idx) => {
    const safeTitle = (proj.title || `tutorial_${idx + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 35);
    const baseName = `${idx + 1}_${safeTitle}`;

    // Add JSON
    folder?.file(`${baseName}.json`, JSON.stringify(proj, null, 2));

    // Add Markdown
    let md = `# ${proj.title}\n\n`;
    md += `**Description:** ${proj.description}\n\n`;
    md += `- **Duration:** ${proj.duration}\n`;
    md += `- **Avatar:** ${proj.avatar}\n`;
    md += `- **Voice:** ${proj.voice}\n`;
    md += `- **Model Router:** ${proj.provider} / ${proj.model}\n\n`;
    md += `## Tutorial Timeline & Steps\n\n`;
    (proj.steps || []).forEach((step, sIdx) => {
      md += `### Step ${sIdx + 1} [${step.time}]\n`;
      md += `**Visual Asset:** ${step.visual}\n\n`;
      md += `**Voice Script:** "${step.script}"\n\n`;
    });
    folder?.file(`${baseName}.md`, md);
  });

  // Add a manifest README
  const manifest = `# Xennials Video Tutorial Batch Export\n\nExported ${projects.length} automated tutorials on ${new Date().toISOString()}.\n\n` +
    projects.map((p, i) => `${i + 1}. **${p.title}** (${p.duration}, ${p.provider}/${p.model})`).join('\n');
  folder?.file('README.md', manifest);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `xennials_tutorials_batch_${Date.now()}.zip`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
