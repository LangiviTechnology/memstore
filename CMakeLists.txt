cmake_minimum_required(VERSION 3.21)
project(memstore C)

set(CMAKE_C_STANDARD 23)

add_library(memstore SHARED library.c)
