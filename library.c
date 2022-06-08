#include "library.h"

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

typedef struct pair_s {
    char name[INT16_MAX];
    char *value;
} pair_t;

struct heap_s {
    pair_t *heap;
    size_t size;
};
static unsigned long long allocated = 0;
static struct heap_s heap = {.heap=NULL, .size=0};

static pair_t create_pair(char *name, char *value, size_t size) {
        pair_t  pair = {};
        strcpy(pair.name, name);
        pair.value = calloc(size, sizeof(char));
        memcpy(pair.value, value, size);
    return  pair;
}


void add_kv(char *name, char *value, size_t size) {
    printf("%s\n", name);
    printf("%s\n", value);
    printf("%zu\n", size);

    if (allocated == 0) {
        heap.heap = calloc(10, sizeof(pair_t));
        allocated = 10;
    } else if (heap.size == allocated){
        allocated +=10;
        heap.heap = realloc(heap.heap, sizeof(pair_t) * allocated);
    }
    heap.heap[heap.size] = create_pair(name, value, size);
    heap.size++;
}
char * get_kv(char *name) {
    for (int i = 0; i < heap.size; ++i) {
        if (strcmp(name, heap.heap[i].name)==0){
            return heap.heap[i].value;
        }
    }
    return NULL;
}
 bool delete_kv(char *name) {
    for (int i = 0; i < heap.size; ++i) {
        if (strcmp(name, heap.heap[i].name)==0){
           heap.size--;
            free(heap.heap[i].value);
            for (int j = i+1; j < heap.size; ++j) {
                heap.heap[i] = heap.heap[j];
            }
            return true;
        }
    }
     return false;
}