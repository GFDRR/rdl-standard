export function loadFiles() {
    let sdata = import.meta.glob('./fixtures/*.json', { eager: true, query: '?raw', import: 'default' });
    let files = {};
    Object.keys(sdata).forEach(function(key) {
        let data = JSON.parse(sdata[key]);
        files[data['id']] = sdata[key];
    });
    return files;
}
