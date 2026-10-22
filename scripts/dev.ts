import {existsSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {config} from 'dotenv';
async function main(){
 if(!existsSync('.env'))writeFileSync('.env',`DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0"\nAUTH_SECRET="${randomBytes(32).toString('hex')}"\nAUTH_URL="http://localhost:3000"\nDEMO_MODE="true"\nAI_PROVIDER="mock"\nLOCAL_DB="pglite"\nDATA_REGION="UAE"\n`);
 config({quiet:true});
 const run=(args:string[])=>new Promise<void>((resolve,reject)=>{const child=spawn('pnpm',args,{stdio:'inherit',env:process.env});child.on('exit',code=>code===0?resolve():reject(new Error(args.join(' '))));});
 let stop:undefined|(()=>Promise<void>);
 if(process.env.LOCAL_DB==='pglite'){
  mkdirSync('.local',{recursive:true});
  const {PGlite}=await import('@electric-sql/pglite');const {vector}=await import('@electric-sql/pglite-pgvector');const {PGLiteSocketServer}=await import('@electric-sql/pglite-socket');
  const dataDir=join(tmpdir(),'darivo-postgres-'+createHash('sha256').update(process.cwd()).digest('hex').slice(0,12));if(existsSync('.local/postgres')&&!existsSync(dataDir))renameSync('.local/postgres',dataDir);const database=await PGlite.create(dataDir,{extensions:{vector}});const server=new PGLiteSocketServer({db:database,host:'127.0.0.1',port:55432,maxConnections:32});await server.start();stop=async()=>{await server.stop();await database.close();};
  console.info('Local PostgreSQL + pgvector ready (PGlite development fallback).');
 }
 await run(['db:generate']);await run(['db:migrate']);await run(['db:seed']);
 const app=spawn('pnpm',['dev:next'],{stdio:'inherit',env:process.env});
 const shutdown=async()=>{app.kill('SIGTERM');await stop?.();process.exit(0);};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
 app.on('exit',async code=>{await stop?.();process.exit(code??0);});
}
main().catch(e=>{console.error(e);process.exit(1);});
