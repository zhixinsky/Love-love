import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modulesDir = path.join(__dirname, '..', 'apps', 'server', 'src', 'modules');

const modules = [
  {
    name: 'user',
    routes: [
      { method: 'Get', path: 'profile', handler: 'getProfile' },
      { method: 'Put', path: 'profile', handler: 'updateProfile' },
      { method: 'Get', path: 'home', handler: 'getHome' },
      { method: 'Post', path: 'block', handler: 'blockUser' },
    ],
  },
  {
    name: 'couple',
    routes: [
      { method: 'Post', path: 'invite', handler: 'invite' },
      { method: 'Post', path: 'bind', handler: 'bind' },
      { method: 'Get', path: 'info', handler: 'info' },
      { method: 'Post', path: 'unbind', handler: 'unbind' },
    ],
  },
  {
    name: 'diary',
    routes: [
      { method: 'Post', path: '', handler: 'create' },
      { method: 'Get', path: 'list', handler: 'list' },
      { method: 'Get', path: ':id', handler: 'detail' },
      { method: 'Put', path: ':id', handler: 'update' },
      { method: 'Delete', path: ':id', handler: 'remove' },
    ],
  },
  {
    name: 'post',
    routes: [
      { method: 'Post', path: '', handler: 'create' },
      { method: 'Get', path: 'list', handler: 'list' },
      { method: 'Get', path: ':id', handler: 'detail' },
      { method: 'Delete', path: ':id', handler: 'remove' },
    ],
  },
  {
    name: 'interaction',
    prefix: '',
    routes: [
      { method: 'Post', path: 'like/toggle', handler: 'toggleLike', ctrl: 'interaction' },
      { method: 'Post', path: 'collect/toggle', handler: 'toggleCollect', ctrl: 'interaction' },
      { method: 'Post', path: 'comment', handler: 'createComment', ctrl: 'interaction' },
      { method: 'Get', path: 'comment/list', handler: 'commentList', ctrl: 'interaction' },
    ],
  },
  {
    name: 'bottle',
    routes: [
      { method: 'Post', path: '', handler: 'throwBottle' },
      { method: 'Post', path: 'pick', handler: 'pick' },
      { method: 'Post', path: 'reply', handler: 'reply' },
    ],
  },
  {
    name: 'chat',
    routes: [
      { method: 'Get', path: 'session/list', handler: 'sessionList' },
      { method: 'Get', path: 'message/list', handler: 'messageList' },
      { method: 'Post', path: 'message', handler: 'sendMessage' },
    ],
  },
  {
    name: 'ai',
    routes: [
      { method: 'Post', path: 'session', handler: 'createSession' },
      { method: 'Post', path: 'chat', handler: 'chat' },
      { method: 'Get', path: 'memory/list', handler: 'memoryList' },
      { method: 'Delete', path: 'memory/:id', handler: 'deleteMemory' },
      { method: 'Post', path: 'report/generate', handler: 'generateReport' },
      { method: 'Get', path: 'report/:id', handler: 'getReport' },
    ],
  },
  {
    name: 'anniversary',
    routes: [
      { method: 'Post', path: '', handler: 'create' },
      { method: 'Get', path: 'list', handler: 'list' },
      { method: 'Delete', path: ':id', handler: 'remove' },
    ],
  },
  {
    name: 'wish',
    routes: [
      { method: 'Post', path: '', handler: 'create' },
      { method: 'Get', path: 'list', handler: 'list' },
      { method: 'Post', path: ':id/complete', handler: 'complete' },
    ],
  },
  {
    name: 'notification',
    routes: [
      { method: 'Get', path: 'list', handler: 'list' },
      { method: 'Post', path: 'read', handler: 'markRead' },
    ],
  },
  {
    name: 'upload',
    routes: [{ method: 'Post', path: 'token', handler: 'getToken' }],
  },
  {
    name: 'report',
    routes: [{ method: 'Post', path: '', handler: 'submit' }],
  },
  {
    name: 'admin',
    routes: [
      { method: 'Post', path: 'login', handler: 'login', public: true },
      { method: 'Get', path: 'audit/list', handler: 'auditList' },
      { method: 'Post', path: 'audit/handle', handler: 'auditHandle' },
    ],
  },
];

function pascal(s) {
  return s.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
}

for (const mod of modules) {
  const dir = path.join(modulesDir, mod.name);
  fs.mkdirSync(dir, { recursive: true });
  const Class = pascal(mod.name);
  const ctrlName = mod.name === 'interaction' ? 'Interaction' : Class;

  const controllerMethods = mod.routes
    .map((r) => {
      const decorator = r.method;
      const routePath = r.path === '' ? '' : r.path;
      return `  @${decorator}('${routePath}')\n  ${r.handler}() {\n    return this.${mod.name}Service.${r.handler}();\n  }\n`;
    })
    .join('\n');

  const serviceMethods = mod.routes
    .map((r) => `  ${r.handler}() {\n    return { todo: true, module: '${mod.name}', action: '${r.handler}' };\n  }\n`)
    .join('\n');

  const controllerPath = mod.name === 'interaction' ? '' : mod.name;
  const controllerDecorator =
    mod.name === 'interaction'
      ? "@Controller()"
      : mod.name === 'admin'
        ? "@Controller('admin')"
        : `@Controller('${mod.name}')`;

  fs.writeFileSync(
    path.join(dir, `${mod.name}.service.ts`),
    `import { Injectable } from '@nestjs/common';\n\n@Injectable()\nexport class ${Class}Service {\n${serviceMethods}}\n`,
  );

  const publicImports = mod.routes.some((r) => r.public)
    ? `import { Public } from '../../common/decorators/public.decorator';\n`
    : '';
  const publicDecorators = mod.routes
    .map((r) =>
      r.public
        ? `  @Public()\n  @${r.method}('${r.path}')\n  ${r.handler}() {\n    return this.${mod.name}Service.${r.handler}();\n  }\n`
        : null,
    )
    .filter(Boolean);

  const normalMethods = mod.routes
    .filter((r) => !r.public)
    .map((r) => `  @${r.method}('${r.path}')\n  ${r.handler}() {\n    return this.${mod.name}Service.${r.handler}();\n  }\n`)
    .join('\n');

  fs.writeFileSync(
    path.join(dir, `${mod.name}.controller.ts`),
    `import { ${mod.routes.map((r) => r.method).filter((v, i, a) => a.indexOf(v) === i).join(', ')} } from '@nestjs/common';\n${publicImports}import { ${Class}Service } from './${mod.name}.service';\n\n${controllerDecorator}\nexport class ${Class}Controller {\n  constructor(private readonly ${mod.name}Service: ${Class}Service) {}\n\n${publicDecorators.join('')}${normalMethods}}\n`,
  );

  fs.writeFileSync(
    path.join(dir, `${mod.name}.module.ts`),
    `import { Module } from '@nestjs/common';\nimport { ${Class}Controller } from './${mod.name}.controller';\nimport { ${Class}Service } from './${mod.name}.service';\n\n@Module({\n  controllers: [${Class}Controller],\n  providers: [${Class}Service],\n  exports: [${Class}Service],\n})\nexport class ${Class}Module {}\n`,
  );
}

console.log('Scaffolded', modules.length, 'modules');
