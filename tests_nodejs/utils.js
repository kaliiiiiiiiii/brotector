import { dirname } from 'path';
import { fileURLToPath } from 'url';
import net from "net";
import StaticServer from 'static-server'

const __dirname = dirname(fileURLToPath(import.meta.url));
const __main_dir__ = dirname(__dirname)

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

const port = await new Promise( res => {
    const srv = net.createServer();
    srv.listen(0, () => {
        const port = srv.address().port
        srv.close((err) => res(port))
    });
})

const __server_url__ = `http://localhost:${port}`

const server = new StaticServer({
    rootPath: __main_dir__,            // required, the root of the server file tree
    port: port,               // required, the port to listen
    host: 'localhost',       // optional, defaults to any interface
  });

await new Promise((resolve, reject)=>{
    try{
        server.start(resolve)
    }catch(e){reject(e)}
})

export { __main_dir__,  __server_url__, sleep}