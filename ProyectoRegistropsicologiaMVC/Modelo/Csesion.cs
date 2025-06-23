using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelo
{
    public class Csesion
    {
        public int idSesion { get; set; }

        public DateTime fechaSesion { get; set; }


        public string temasTratados { get; set; }
        public string notas { get; set; }
        public string estado { get; set; }


        public Cpaciente sdniPaciente { get; set; }

        public Cpsicologo sidPsicologo { get; set; }
    }
}
