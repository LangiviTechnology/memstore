#ifndef MEMSTORE_LIBRARY_H
#define MEMSTORE_LIBRARY_H

#include <stddef.h>
#include <stdbool.h>

void add_kv(char * name, char * value, size_t size);
char * get_kv(char *name);
bool delete_kv(char *name);

#endif //MEMSTORE_LIBRARY_H
