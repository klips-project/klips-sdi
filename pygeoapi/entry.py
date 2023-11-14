import os

DEBUG = os.getenv("DEBUG", "False") == "True"
if DEBUG:
    os.environ["FLASK_ENV"] = "development"
    os.environ["PYGEOAPI_HOME"] = "/pygeoapi"
    os.environ["PYGEOAPI_CONFIG"] = "/pygeoapi/local.config.yml"
    os.environ["PYGEOAPI_OPENAPI"] = "/pygeoapi/local.openapi.yml"
    from pygeoapi.flask_app import serve
    import debugpy
else:
    import subprocess


def initialize_debugger():
    if debugpy.is_client_connected():
        print("Debugger is already connected.")
        return
    print("Adding debugger again.")
    debugpy.listen(("0.0.0.0", 5678))
    print("Debugger is ready to be attached, press F5.", flush=True)
    debugpy.wait_for_client()
    print("Visual Studio Code debugger is now attached.", flush=True)


if DEBUG:
    initialize_debugger()
    serve()
else:
    subprocess.call(["bash", "/entrypoint.sh"])
