using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;

namespace Modelo
{
    public class Cconexion
    {
        public static string cadena = ConfigurationManager.ConnectionStrings["cadena_conexion"].ConnectionString;

    }
}
