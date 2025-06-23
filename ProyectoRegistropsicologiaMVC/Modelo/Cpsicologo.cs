using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelo
{
    public class Cpsicologo
    {
        public int idpsicologo { get; set; }
        public string nombres { get; set; }
        public string aPaterno { get; set; }
        public string aMaterno { get; set; }
        public string sexo { get; set; }
        public string numeroTelefono { get; set; }
        public string correoInstitucional { get; set; }
        public DateTime fechaNacimiento { get; set; }
        public string nombreUsuario { get; set; }
        public string clave { get; set; }
    }
}
